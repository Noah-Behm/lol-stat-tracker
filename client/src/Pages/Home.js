import {useLocation} from 'react-router-dom';
import React from 'react';
import axios from 'axios';
import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // import first
import './Signup.css';
import { TextField, Button, Box } from '@material-ui/core';

const Home = () => {

    const user = useLocation();


    const [showWheel, setShowWheel] = useState(false);

    const [challengeData, setChallengeData] = useState([]);

    const [summoner, setSummoner] = useState({
        summoner_name: "",
    });


    const [matches, setMatches] = useState([]);


    const [matchData, setMatchData] = useState([]);


    const handleChangeSummoner = (e) => {
        setSummoner(prev=>({...prev, [e.target.name]: e.target.value}));
    };


    const handleClickSummoner = async e =>{
        try{
            const res = await axios.post("http://localhost:8800/puuid", summoner);
            const payload = {
                'user':user.state.name,
                'summoner':summoner.summoner_name,
                'puuid':res.data.puuid,
            };
            const res2 = await axios.post("http://localhost:8800/summoner", payload);
        }catch (err) {
            console.log(err);
        }
    }


    const handleClickMatches = async e =>{
        try{
            setShowWheel(true);
            setMatchData([]);
            setMatches([]);
            setChallengeData([]);

            const res = await axios.post("http://localhost:8800/existingpuuid", user);
            const res2 = await axios.post("http://localhost:8800/matches", res.data);
            for (let i = 0; i < res2.data.length; i++) {
                let new_match = res2.data[i];
                setMatches(matches => [...matches, new_match]);
            }

            let matchdata = await axios.post("http://localhost:8800/matchdata", [matches, res.data[0].puuid]);
            setMatchData(matchData => [...matchData, matchdata.data]);

            let challenges = await axios.post("http://localhost:8800/challenges", [res.data[0].puuid]);
            
            setChallengeData(challenges.data)
            console.log("CHALLENGES:  ", challengeData)
            setShowWheel(false);


        }catch (err) {
            console.log(err);
        }
    }


    function generateMatchHTML(){
        if (matchData.length === 0){
            var text = ''
            for (let i = 0; i < 10; i++){
                text += "<div class='match_container'>"
                text += "<h3 class='match_header'> Match " + (i+1) + '</h3>'
                text += "<ul class='match_list'>"
                text += "<li class='match_line'>" + ' KDA: Not Loaded' + '</li>'
                text += "<li class='match_line'>" + ' CS: Not Loaded' + '</li>'
                text += "<li class='match_line'> Match Not Loaded </li>"
                text += "<li class='match_line'>" +  " Position Not Loaded </li>"
                text += '</ul>'
                text += '</div>'
            }
            return text
        }
        var text = ''
        for (let i = 0; i < matchData[0].length; i++){
            text += "<div class='match_container'>"
            text += "<h3 class='match_header'> Match " + (i+1) + '</h3>'
            text += "<ul class='match_list'>"
            text += "<li class='match_line'>" + matchData[0][i].championName + '     ' + matchData[0][i].kills + '/' + matchData[0][i].deaths + '/' + matchData[0][i].assists
            + ' KDA: ' + ((matchData[0][i].kills + matchData[0][i].assists)/matchData[0][i].deaths).toFixed(2) + '</li>'
            text += "<li class='match_line'>CS: " + (matchData[0][i].totalMinionsKilled + matchData[0][i].neutralMinionsKilled) + '</li>'
            if (matchData[0][i].win === false){
                text += "<li class='match_line'> Match Lost </li>"
            }
            else{
                text += "<li class='match_line'> Match Won </li>"
            }
            text += "<li class='match_line'>" 
            if (matchData[0][i].individualPosition == "UTILITY") {
                text += "SUPPORT </li>"
            } else {
                text += matchData[0][i].individualPosition + "</li>"
            }
            text += '</ul>'
            text += '</div>'
        }

        return text
    }


    function generateStatsHTML() {
        if (matchData.length === 0){
            var text = "<h1 class='stats_header'>Average Stats</h1>"
            text += '<ul>'
            text += "<li class='stat_line'> Average KDA: " + '</li>'
            text += "<li class='stat_line'> Average CS: " +  '</li>'
            text += "<li class='stat_line'> Average Number of Pings: "  + '</li>'
            text += "<li class='stat_line'> Average Vision Score: " +  '</li>'
            text += "<li class='stat_line'> Win Rate: " +  '%</li>'
            text += '</ul>'
            return text
        }
        var kills = 0
        var deaths = 0
        var assists = 0
        var minions = 0
        var pings = 0
        var wards = 0
        var vision_score = 0
        var wins = 0
        var losses = 0
        //console.log("STATS HTML:: ", matchData[0])
        for (let i = 0; i < matchData[0].length; i++){
            kills += matchData[0][i].kills
            deaths += matchData[0][i].deaths
            assists += matchData[0][i].assists
            minions += matchData[0][i].totalMinionsKilled + matchData[0][i].neutralMinionsKilled
            pings += (matchData[0][i].allInPings + matchData[0][i].assistMePings + matchData[0][i].baitPings + matchData[0][i].basicPings 
                + matchData[0][i].commandPings + matchData[0][i].dangerPings + matchData[0][i].enemyMissingPings + matchData[0][i].enemyVisionPings
                + matchData[0][i].getBackPings + matchData[0][i].holdPings + matchData[0][i].needVisionPings + matchData[0][i].onMyWayPings
                + matchData[0][i].pushPings + matchData[0][i].visionClearedPings)
            vision_score += matchData[0][i].visionScore
            if (matchData[0][i].win == true) {
                wins += 1;
            } 
            else {
                losses += 1;
            }
        }
        //console.log("vision_score:  ", vision_score)
        var text = "<h1 class='stats_header'>Average Stats</h1>"
        text += '<ul>'
        text += "<li class='stat_line'> Average KDA: " + ((kills+assists)/deaths).toFixed(2) + '</li>'
        text += "<li class='stat_line'> Average CS: " + ((minions)/matchData[0].length) + '</li>'
        text += "<li class='stat_line'> Average Number of Pings: " + ((pings)/matchData[0].length) + '</li>'
        text += "<li class='stat_line'> Average Vision Score: " + ((vision_score)/matchData[0].length) + '</li>'
        text += "<li class='stat_line'> Win Rate: " + (wins/matchData[0].length).toFixed(2)*100 + '%</li>'
        text += '</ul>'
        return text
    }

    function generateChallengesHTML(){
        if (challengeData.length === 0){
            var text = "<h1 class='stats_header'>Challenge To Target</h1>"
            text += '<ul>'
            text += "<li class='stat_line'> Please Reload Matches To See Challenge Info " + '</li>'
            return text
        }

        var text = "<h1 class='stats_header'>Challenges To Target</h1>"

        for (let i = 0; i < challengeData.length; i++){
            text += "<h2 class='stats_header'> Challenge " + (i+1) + '</h2>'
            text += '<ul>'
            text += "<li class='stat_line'> Challenge Name: " + challengeData[i][4] + '</li>'
            text += "<li class='stat_line'> Current Rank: " + challengeData[i][1] + '</li>'
            text += "<li class='stat_line'> Current Value: " + challengeData[i][0] + '</li>'
            text += "<li class='stat_line'> Next Rank Value: " + challengeData[i][3] + '</li>'
            text += "<li class='stat_line'> Description: " + challengeData[i][5] + '</li>'
            text += '</ul>'
        }

        return text
    }

    //<div className='loading'>{showWheel ? <div>Loading...</div> : null}</div>
    //<div>logged in as {user.state.name}</div>
    return (
        <div>
            <div className='summoner_box'>
                <h3 className='home_header'>Save or update your summoner name: </h3>
                <Box className='wrapper_home_input'><TextField type='text' placeholder='Summoner Name' onChange={handleChangeSummoner} name = "summoner_name"></TextField></Box>
            </div>
            
            <Box className='wrapper_home'><Button variant='outlined' className='summoner_submit' onClick={handleClickSummoner} id='summoner_submit'>Submit Summoner</Button></Box>
            <Box className='wrapper_home'><Button variant='outlined' className='matches_submit' onClick={handleClickMatches} id='matches_submit'>Show last 10 games</Button></Box>
            <div className='loading'>{showWheel ? <div>Loading...</div> : null}</div>
            <div className='home_body'>
                <div className='matches' dangerouslySetInnerHTML={{__html: generateMatchHTML()}}></div>
                <div className='stats' dangerouslySetInnerHTML={{__html: generateStatsHTML()}}></div>
                <div className='challenges' dangerouslySetInnerHTML={{__html: generateChallengesHTML()}}></div>
            </div>
            
            
        </div>
  )
}

export default Home