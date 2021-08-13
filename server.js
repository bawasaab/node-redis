const express = require("express");
const axios = require("axios");
const redis = require("redis");
const app = express();

const redisPort = 6379
const redisClient = redis.createClient(redisPort);

//log error to the console if any occurs
redisClient.on("error", (err) => {
    console.log(err);
});

app.get("/user/:id", async (req, res) => {
    const searchTerm = req.params.id;
    try {

        redisClient.get(searchTerm, async (err, jobs) => {
            if (err) throw err;

            if (jobs) {
                res.status(200).send({
                    jobs: JSON.parse(jobs),
                    message: "data retrieved from the cache"
                });
            } else {
                const jobs = await axios.get(`https://node.gutsyminds.com/users/${searchTerm}`);
                redisClient.setex(searchTerm, 600, JSON.stringify(jobs.data));
                res.status(200).send({
                    jobs: jobs.data,
                    message: "cache miss"
                });
            }
        });

        // const jobs = await axios.get(`https://node.gutsyminds.com/users/${searchTerm}`);
        // res.status(200).send({
        //     jobs: jobs.data,
        //     message: "cache miss"
        // });
    } catch(err) {
        res.status(500).send({message: err.message});
    }
});


app.listen(process.env.PORT || 3000, () => {
    console.log("Node server started");
});