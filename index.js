const express = require('express');
const fileUpload = require('express-fileupload');
const { exec } = require('child_process');
const app = express();

app.use(fileUpload());

app.get('/', (req, res) => {
  return res.send("At index");
});

app.post('/test-contract', (req, res) => {

  if (!req.body.id) {
    return res.status(400).send('id parameter are required.');
  }


  if (!req.files || !req.files.contract) {
    return res.status(400).send('Contract file required.');
  }
  
  const contractId = req.body.id;
  const contractFile = req.files.contract;

  var contractName = "";

  if(contractId == 1){
    contractName = "Lock";
  }else if(contractId == 2){
    contractName = "Greeter";
  } else {
    return res.status(500).send(`Invalid contract ID, id is ${contractId}`);
  }
  
  const contractPath = `./contracts/${contractName}.sol`;
  const testingFilePath = `./test/${contractName}.js`;

  // copy the user contract
  contractFile.mv(contractPath, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    // Run Hardhat tests
    exec(`npx hardhat test ${testingFilePath}`, (error, stdout, stderr) => {
      if (error) {
        return res.status(500).send(error.message);
      }
      
      const testResult = stdout.toString();
      res.send(testResult);
    });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}\n`);
  console.log(`Server routes is:\n`);
  console.log(`****************************`);
  console.log(`[*] /test-contract`);
  console.log(`        method: POST`);
  console.log(`        param: id`);
  console.log(`        file: contract`);
  console.log(`****************************`);
});