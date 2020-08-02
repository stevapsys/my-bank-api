import express from "express";
import { promises as fs } from "fs";

const { readFile, writeFile } = fs;

//criando uma variável global pra não ter que ficar passando "accounts.json" toda vez 
global.fileName = "accounts.json"

const router = express.Router();

//CRIANDO O METÓDO POST - adicionando uma nova informação no arquivo json
router.post("/", async (req, res, next) => {
    //para testar se tá funcionando a crianção do arquivo json no insmonina
    // console.log(req.body);
    try {
        let account = req.body;
        //fazendo a validação
        if (!account.name || !account.balance == null) {
            throw new Error("Name e Balance são obrigatórios");
        }
        //colocar o JSON em parce pra ele ler o arquivo
        const data = JSON.parse(await readFile(global.fileName));
        //console.log(data); 

        //colocando o que eu quero adicionar no account 
        account = { id: data.nextId++,
            name:account.name,
            balance:account.balance,
            ...account }
        //daria também pra fazer dessa forma
        //account.id = data.nextId,
        //data.nextId++; 

        //metódo push pra adicionar novas infos no arquvi accounts.js
        data.accounts.push(account);

        //pra escrever o arquivo voltar pra stringify 
        await writeFile(global.fileName, JSON.stringify(data, null, 2))
        res.send(account);
    } catch (err) {
        next(err);
    }

});

//metodo GET - FAZER A LEITURA DO ARQUVIO 

router.get("/", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName))
        //deletar o nextId
        delete data.nextId
        res.send(data);
        logger.info("GET/account")
    } catch (err) {
        next(err);
    }
});

//metodo GET retornando por ID 

router.get("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        //procurar qual é o id que eu quero
        // parseInt pra ele entender mesmo não sendo o mesmo tipo de info. Se trocar === por ==, não precisaria dele 
        const account = data.accounts.find(account => account.id === parseInt(req.params.id))
        res.send(account);
        //pegando o id da requisição 
        req.params.id
    } catch (err) {
        next(err);
    }
});

//metódo DELETE
router.delete("/:id", async (req, res, next) => {
    try {
        const data = JSON.parse(await readFile(global.fileName));
        //para retornar o mesmo array, menos o id que estamos pendindo pra tirar 
        data.accounts = data.accounts.filter(account => account.id !== parseInt(req.params.id));

        await writeFile(global.fileName, JSON.stringify(data, null, 2))
        res.end();
    } catch (err) {
        next(err);
    }
});

//metódo PUT - para editar o arquivo de forma integrar / substituir todas as infos do arquivo

router.put("/", async (req, res, next) => {
    try {
        const account = req.body;
        const data = JSON.parse(await readFile(global.fileName));
        //vai procurar no indice, a conta que tem esse id 
        const index = data.accounts.findIndex(a => a.id === account.id);

        if(index === -1){
            throw new Error("Registro não encontrado.");
        }

        data.accounts[index].name = account.name;
        data.accounts[index].balance = account.balance;

        await writeFile(global.fileName, JSON.stringify(data));
        res.send(data)
    } catch (err) {
        next(err);
    }
})

//metódo PATCH - para editar infos parciais

router.patch("/updateBalance", async (req, res, next) => {
    try {
        const account = req.body;
        const data = JSON.parse(await readFile(global.fileName));
        //vai procurar no indice, a conta que tem esse id 
        const index = data.accounts.findIndex(a => a.id === account.id);

        if (!account.id || !account.balance == null) {
            throw new Error("Name e Balance são obrigatórios");
        }

        if(index === -1){
            throw new Error("Registro não encontrado.");
        }

        //colocar o que você quer mudar, nesse caso é o balance 
        data.accounts[index].balance = account.balance;
        await writeFile(global.fileName, JSON.stringify(data));
        res.send(data.accounts[index])
    } catch (err) {
        next(err);
    }
})

//tratamento padrão de erros
router.use((err, req, res, next) => {
    global.logger.error(`${req.method} ${req - baseUrl} - ${err.message}`);
    res.status(400).send({ error: err.message })

});

//exportando o router pra index.js 
export default router;