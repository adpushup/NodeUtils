const { BlobServiceClient } = require("@azure/storage-blob");

module.exports = class BlobStorage {
  constructor(connectionString) {
    this.connectionString = connectionString;
    this.blobServiceClient = BlobServiceClient.fromConnectionString(
      this.connectionString
    );
    return this;
  }

  async uploadToStorageContainer(containerName, data, fileName) {
    try {
      if (this.blobServiceClient) {
        this.containerClient =
          this.blobServiceClient.getContainerClient(containerName);
        await this.containerClient.createIfNotExists();
        if (fileName.startsWith("/")) {
          fileName = fileName.substring(1);
        }
        if (typeof data !== "string" && !Buffer.isBuffer(data)) {
          data = JSON.stringify(data);
        }
        return await this.uploadBlob(fileName, data).then((response) => {
          if (response.error) {
            throw new Error(response.error);
          }
          return this.validateOperation(
            response.uploadResponse,
            "Upload",
            () => ({
              url: response.blobUrl,
            })
          );
        }); //Creates a new block blob, or updates the content of an existing block blob;
      } else {
        throw new Error("Please initialize the service before using!");
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async uploadBlob(fileName, data) {
    try {
      if (this.containerClient) {
        const blockBlobClient =
          this.containerClient.getBlockBlobClient(fileName);
        const uploadResponse = await blockBlobClient.upload(data, data.length);
        const blobUrl = blockBlobClient.url;
        return { uploadResponse, blobUrl };
      } else {
        throw new Error("Please initialize container before uploading!");
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async downloadBlob(fileName, offset = 0) {
    try {
      if (this.containerClient) {
        const blockBlobClient =
          this.containerClient.getBlockBlobClient(fileName);
        return await blockBlobClient.download(offset);
      } else {
        throw new Error("Please initialize the container before downloading!");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async getExistingBlob(containerName, fileName, offset = 0) {
    try {
      if (this.blobServiceClient) {
        this.containerClient =
          this.blobServiceClient.getContainerClient(containerName);
        if (fileName.startsWith("/")) fileName = fileName.substring(1);
        return await this.downloadBlob(fileName, offset).then((response) =>
          this.validateOperation(response, "Download", () =>
            this.streamToText(response.readableStreamBody)
          )
        );
      } else {
        throw new Error("Please initialize the service before using");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async streamToText(readable) {
    readable.setEncoding("utf8");
    let data = "";
    for await (const chunk of readable) {
      data += chunk;
    }
    return data;
  }

  async validateOperation(response, operation, callback = false) {
    if (response.succeeded || !(response.errorCode || response.error))
      return callback ? await callback() : true;
    throw new Error(
      `${operation} operation failed due to some reason: ${
        response.errorCode || response.error
      }`
    );
  }

  async deleteBlobFromContainer(containerName, fileName) {
    try {
      if (this.blobServiceClient) {
        this.containerClient =
          this.blobServiceClient.getContainerClient(containerName);
        if (fileName.startsWith("/")) fileName = fileName.substring(1);

        const blockBlobClient =
          this.containerClient.getBlockBlobClient(fileName);
        return await blockBlobClient
          .deleteIfExists()
          .then((response) => this.validateOperation(response, "Delete"));
      } else {
        throw new Error("Please initialize the service before using");
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  async uploadToBlob(blobConfig) {
    const processConfigAndUpload = async (config) => {
      const { containerName, fileName, data } = config;
      if (containerName && fileName && data) {
        //ignoring the / in beginning if it is present
        if (fileName.startsWith("/")) fileName = fileName.substring(1);
        return await this.uploadToStorageContainer(
          containerName,
          data,
          fileName
        );
      } else {
        throw new Error(
          "containerName or fileName or data not found in config!"
        );
      }
    };
    try {
      if (Array.isArray(blobConfig)) {
        if (!blobConfig.length) {
          return { error: "Please provide valid array of required config" };
        }
        let results = [];
        for (let config of blobConfig) {
          let result = await processConfigAndUpload(config);
          results.push({ result, config });
        }
        return results;
      } else {
        return await processConfigAndUpload(blobConfig);
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  handleError(error) {
    return { error: error.message, stack: error.stack };
  }
};
