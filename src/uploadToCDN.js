const BlobStorage = require("./Blob");
const axios = require("axios");

const processConfig = async (connectionString, uploadConfig) => {
  try {
    const { containerName, fileName, data, queuePublishEndpoint, queue } =
      uploadConfig;
    if (!(containerName && fileName && data && queuePublishEndpoint && queue)) {
      return {
        error: `containerName or fileName or data or queuePublishEndpoint or queue Not found`,
      };
    }

    const blob = new BlobStorage(connectionString);
    const blobResponse = await blob.uploadToBlob({
      containerName,
      fileName,
      data,
    });
    if (!blobResponse.error) {
      //Publish message to queue
      return await publishToQueue(
        blobResponse.url,
        fileName,
        queuePublishEndpoint,
        queue
      );
    } else {
      throw `Some Error in Blob Upload: ${blobResponse}`;
    }
  } catch (error) {
    return { error: `Some Error in function : ${error}` };
  }
};

const publishToQueue = async (
  blobFileUrl,
  fileName,
  queuePublishEndpoint,
  queue
) => {
  const msgBody = {
    type: 2,
    blobFilePath: blobFileUrl,
    fileName,
  };

  const requestSettings = {
    method: "POST",
    url: queuePublishEndpoint,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    data: {
      queue: queue,
      data: msgBody,
    },
    responseType: "json",
  };

  return await axios(requestSettings)
    .then(() => blobFileUrl)
    .catch((error) => {
      return { error: `failed to push message to queue: ${error}` };
    });
};

/*Expects uploadConfig to either be an object or array of objects of form
  { containerName - Name of Azure container to upload the file to, 
    fileName - FileName of blob, same will be passed to CDN, 
    data - blob content, 
    queuePublishEndpoint - AP publisher API Endpoint, 
    queue - queueName to Publish Message to 
  }
*/
const uploadAndPushToQueue = async (blobConnectionString, uploadConfig) => {
  if (Array.isArray(uploadConfig)) {
    if (!uploadConfig.length)
      return { error: "Please provide valid array of required config" };
    let results = [];

    for (let config of uploadConfig) {
      const result = await processConfig(blobConnectionString, config);
      results.push({ result, config });
    }
    return results;
  } else {
    return await processConfig(blobConnectionString, uploadConfig);
  }
};

module.exports = uploadAndPushToQueue;
