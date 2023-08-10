const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const app = express();
const fs = require('fs').promises;

async function deleteFile(filePath) {
  try {
    await fs.unlink(filePath);
    console.log(`File ${filePath} deleted successfully.`);
  } catch (error) {
    console.error(`Error deleting file ${filePath}:`, error);
  }
}


app.use(fileUpload());

app.get('/', (req, res) => {
  return res.send("At index");
});

app.post('/test-contract', async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(400).send('id parameter is required.');
    }

    if (!req.files || !req.files.contract) {
      return res.status(400).send('Contract file required.');
    }

    const contractId = req.body.id;
    const contractFile = req.files.contract;

    let contractName = "";

    if (contractId == 1) {
      contractName = "Lock";
    } else if (contractId == 2) {
      contractName = "Greeter";
    } else {
      return res.status(500).send(`Invalid contract ID, id is ${contractId}`);
    }

    const contractPath = `./contracts/${contractName}.sol`;
    const testingFilePath = `./test/${contractName}.js`;

    // Copy the user contract (await added here)
    await contractFile.mv(contractPath);

    // Run Hardhat tests (await added here)
    exec(`npx hardhat test ${testingFilePath}`, async (error, stdout, stderr) => {
      if (error) {
        await deleteFile(contractPath);
        return res.status(500).send(error.message);
      }

      const testResult = stdout.toString();
      await deleteFile(contractPath);
      return res.send(testResult);
    });
  } catch (err) {
    await deleteFile(contractPath);
    res.status(500).send(err.message);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}\n`);
  console.log(`Server routes are:\n`);
  console.log(`****************************`);
  console.log(`[*] /test-contract`);
  console.log(`        method: POST`);
  console.log(`        param: id`);
  console.log(`        file: contract`);
  console.log(`****************************`);
});
