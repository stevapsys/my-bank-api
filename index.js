import express from "express"; 
import winston from "winston";
import accountsRouter from "./routes/accounts.js"
import {promises as fs} from "fs"; 

const {readFile, writeFile} = fs; 

//criando uma variável global pra não ter que ficar passando "accounts.json" toda vez 
global.fileName = "accounts.json"

const {combine, timestamp, label, printf} = winston.format;
const myFormat = printf(({level, message, label, timestamps}) => {
    return `${timestamps} [${label}] ${level}: ${message}`;
})
//criando uma variável global pro logger usando winston 
global.logger = winston.createLogger({
    level: "silly",
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.File)({filename: "my-bank-api.log"}),

    ],
    format: combine(
        label({label: "my-bank-api"}),
        timestamp(),
        myFormat
    )
})

const app = express();
app.use(express.json());

app.use("/account", accountsRouter);

//criação da APi 
//colocar async por causa do await
app.listen(3000, async ()=> {
    //tentando ler o arquivo accounts.json
    try{
        await readFile("accounts.json")
        logger.info("API Started!")
    //se não pegar o try, criar o arquivo json no catch 
    } catch (err) {
        //criando o que vai ter no início do arquvio JSON
        const initialJson = {
            nextId: 1,
            accounts: []
        }    
        writeFile("accounts.json", JSON.stringify(initialJson)).then(() => {
            logger.info("API Started and File Created")
        //caso dê erro
        }).catch(err => {
            logger.error(err); 
        })
    }
});