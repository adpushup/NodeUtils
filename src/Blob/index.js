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
        return await this.uploadBlob(fileName, JSON.stringify(data)).then((response) =>
          this.validateOperation(response.uploadResponse, "Upload", () => {
            return {
              url: response.blobUrl,
            };
          })
        ); //Creates a new block blob, or updates the content of an existing block blob;
      } else {
        throw "Please initialize the service before using!";
      }
    } catch (error) {
      return {
        error,
      };
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
        throw "Please initialize container before uploading!";
      }
    } catch (error) {
      return {
        error,
      };
    }
  }

  async downloadBlob(fileName, offset = 0) {
    try {
      if (this.containerClient) {
        const blockBlobClient =
          this.containerClient.getBlockBlobClient(fileName);
        return await blockBlobClient.download(offset);
      } else {
        throw "Please initialize the container before downloading!";
      }
    } catch (error) {
      return {
        error,
      };
    }
  }

  async getExistingBlob(containerName, fileName, offset = 0) {
    try {
      if (this.blobServiceClient) {
        this.containerClient =
          this.blobServiceClient.getContainerClient(containerName);

        return await this.downloadBlob(fileName, offset).then((response) =>
          this.validateOperation(response, "Download", () =>
            this.streamToText(response.readableStreamBody)
          )
        );
      } else {
        throw "Please initialize the service before using";
      }
    } catch (error) {
      return {
        error,
      };
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
    throw `${operation} operation failed due to some reason: ${
      response.errorCode || response.error
    }`;
  }

  async deleteBlobFromContainer(containerName, fileName) {
    try {
      if (this.blobServiceClient) {
        this.containerClient =
          this.blobServiceClient.getContainerClient(containerName);
        const blockBlobClient =
          this.containerClient.getBlockBlobClient(fileName);
        return await blockBlobClient
          .deleteIfExists()
          .then((response) => this.validateOperation(response, "Delete"));
      } else {
        throw "Please initialize the service before using";
      }
    } catch (error) {
      return {
        error,
      };
    }
  }

  async uploadToBlob(blobConfig) {
    const processConfigAndUpload = async (config) => {
      const { containerName, fileName, data } = config;
      if (containerName && fileName && data) {
        return await this.uploadToStorageContainer(
          containerName,
          data,
          fileName
        );
      } else {
        return {
          error: "containerName or fileName or data not found in config!",
        };
      }
    };

    if (Array.isArray(blobConfig)) {
      if (!blobConfig.length)
        return { error: "Please provide valid array of required config" };
      let results = [];
      for (let config of blobConfig) {
        let result = await processConfigAndUpload(config);
        results.push({ result, config });
      }
      return results;
    } else {
      return await processConfigAndUpload(blobConfig);
    }
  }
};
