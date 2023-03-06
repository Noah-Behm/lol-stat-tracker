import express from "express"
import mysql from "mysql"
import cors from "cors"
import axios from 'axios';
import util from 'util';

const app = express()
const riotKey = 'RGAPI-e448948e-f559-4228-9f6a-611d7854034b'
const db = mysql.createPool({
    host:"localhost",
    user:"root",
    password:"Jangofet2!",
    database:"stock_app"
})

app.use(express.json())
app.use(cors())
// authentication error:
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'Jangofet2!';

app.get("/", (req, res) => {
    res.json("Hello, this is the backend.");
})

app.post("/signup", (req, res) => {
    const q = "INSERT INTO userinfo (`Username`,`Password`) VALUES (?)";
    const values = [
        req.body.user_signup,
        req.body.pass_signup,
    ];

    db.query(q, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.json("User successfully added!");
    });
});


app.post("/login", (req, res) => {
    const user = req.body.user_login;
    const passw = req.body.pass_login;
    const q = "SELECT * FROM userinfo WHERE Username = ? AND Password = ?";
   // console.log(req)
    db.query(q, [user,passw], (err, data)=>{
        if(err) return res.json(err);
        return res.json(data);
    });
});

app.post("/puuid", async (req,res) => {
    const summoner = req.body.summoner_name;
    //console.log("SUMMONER:  ", summoner);
    const link = 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + summoner + '?api_key=' + riotKey;
    try{
       const response = await axios.get(link);
       return res.json(response.data);
    }
    catch (err) {
        console.log(err);
        return res.json(err);
    }
});

app.post("/summoner", (req, res) => {
    const q = "REPLACE INTO summoner_info (`username`,`summoner_name`, `puuid`) VALUES (?)";
    const values = [
        req.body.user,
        req.body.summoner,
        req.body.puuid,
    ];
   // console.log(values);
    db.query(q, [values], (err, data)=>{
        if(err) return res.json(err);
        return res.json("Summoner successfuly saved to your profile!");
    });
});


app.post("/matches", async (req, res) => {

    const puuid = req.body[0].puuid;
    //console.log("------------------------------------------------------------------------------------------------");
    //console.log(puuid);
    //console.log("------------------------------------------------------------------------------------------------");

    const link = 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + puuid + '/ids?type=ranked&start=0&count=10&api_key=' + riotKey;

    try{
        const response = await axios.get(link);
        return res.json(response.data);
     }
     catch (err) {
         console.log(err);
         return res.json(err);
     }

});

app.post("/existingpuuid", (req, res) => {
    const q = 'SELECT puuid FROM summoner_info WHERE username = ?';
    const user = req.body.state.name;

    try {
        db.query(q, [user], (err, data)=>{
            if(err) return res.json(err);
            return res.json(data);
        });
    }
    catch (err) {
        console.log(err);
         return res.json(err);
    }
});


app.post("/matchdata", async (req, res) => {
    const id = req.body[0];
    const puuid = req.body[1];
    var data = [];
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@", id)
    try{
        
        //console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
        //console.log(response.data.info.participants[0]);
        //console.log('@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')

        for (let j = 0; j < id.length; j++){
            let link = 'https://americas.api.riotgames.com/lol/match/v5/matches/' + id[j] + '?api_key=' + riotKey;
            let response = await axios.get(link);
            console.log(link)
            for (let i = 0; i < 10; i++){
                console.log("TARGET PUUID: ", puuid)
                console.log("CHECK AGAINST ", response.data.info.participants[i].puuid)
                if (response.data.info.participants[i].puuid == puuid){
                    console.log("Game added")
                    data.push(response.data.info.participants[i]);
                }
            }
        }
        return res.json(data);
     }
     catch (err) {
         console.log(err);
         return res.json(err);
     }
});


app.post("/challenges", async (req, res) => {
    const puuid = req.body[0];
    let link = 'https://na1.api.riotgames.com/lol/challenges/v1/player-data/' + puuid + '?api_key=' + riotKey;
    let response = await axios.get(link);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log("challenges start challenges start challenges start ")
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log(response.data)
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log("challenges end challenges end challenges end ")
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    let ids = [];
    let ret_data = [];
    for (let i = 0; i < response.data.challenges.length; i++){
        //console.log(response.data.challenges[i].value)
        let current_value = response.data.challenges[i].value;
        let current_rank = response.data.challenges[i].level;
        let challenge_id = response.data.challenges[i].challengeId;
        let next_rank = '';
        
        if (current_rank == "IRON") {
            next_rank = "bronze";
        } else if (current_rank == "BRONZE"){
            next_rank = "silver";
        } else if (current_rank == "SILVER"){
            next_rank = "gold";
        } else if (current_rank == "GOLD"){
            next_rank = "platinum";
        } else if (current_rank == "PLATINUM"){
            next_rank = "diamond";
        } else if (current_rank == "DIAMOND"){
            next_rank = "master";
        } else if (current_rank == "MASTER"){
            next_rank = "grandmaster";
        } else if (current_rank == "GRANDMASTER"){
            next_rank = "challenger";
        } else if (current_rank == "CHALLENGER"){
            next_rank = "max";
        }

        //console.log(next_rank)
        if (next_rank != "max" && current_value != 0 && next_rank != ''){
            let name = ''
            let description = ''
            let next_value = 0;

            ids.push(challenge_id);
            ret_data.push([current_value, current_rank, next_rank])
        }
        
    }
    
    let q = 'SELECT * FROM challenges WHERE id in (' + ids.join(',') + ');';
    const query = util.promisify(db.query).bind(db);
    let rows = await (async () => {
        const rows = await query(q);
        return rows;
    })()
    
    //console.log(rows);
    for (let i = 0; i < rows.length; i++) {
        ret_data[i].push(rows[i][ret_data[i][2]]); //pushing next rank value
        ret_data[i].push(rows[i]['name']);
        ret_data[i].push(rows[i]['description']);
        ret_data[i].push(ret_data[i][0]/ret_data[i][3]);
        //console.log(rows[i]['diamond'])
        console.log("current: ", ret_data[i][0], "  target: ", ret_data[i][3], "  ID: ", ids[i])
    }
    
    let final_data = [];
    ret_data.sort(function(a,b){return a[6] - b[6];}); 
    let ctr = ret_data.length-1;
    let added = 0;
    while (added < 10){
        if (ret_data[ctr][6] < 1 && ret_data[ctr][5].indexOf("capstone") == -1 && ret_data[ctr][5].indexOf("Cornerstone") == -1 && ret_data[ctr][5].indexOf("group") == -1) {
            final_data.push(ret_data[ctr]);
            added += 1;
        }
        ctr -= 1;
    }

   // console.log(final_data)

    //JSON.parse(JSON.stringify(data))[0]
    //console.log(ids.join(','))
    return res.json(final_data);
});


app.listen(8800, ()=>{
    console.log("Connected to backend!")
})
