const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());

app.get('/',(req, res)=>{
    res.send('To test out the API Serach something like => Eg. https://fast-job-search.onrender.com/android-app-development/bangalore');
})

app.get('/:role/:location', async(req, res)=>{

    try {
        const role = req.params.role;
        const loc = req.params.location;
        const encodedRole = encodeURIComponent(role);
        const encodedLoc = encodeURIComponent(loc);

        const response = await axios.get(`https://${process.env.LINK}/jobs/${encodedRole}-jobs-in-${encodedLoc}/`);
        const page = response.data;

        const $ = cheerio.load(page);
        
        const title = $('.job-title-href');
        const job_title = [];
        $(title).each((index , element)=>{
            job_title[index]=$(element).text();
        })
        
        const company = $('.company-name');
        const company_name = [];
        $(company).each((index , element)=>{
           company_name[index]=$(element).text().trim();
        })

        const location = $('.detail-row-1 span a');
        const company_location = [];
        $(location).each((index, element) => {
            company_location[index] = $(element).text().trim();
        })

        
        const experiences = [];
        $('.row-1-item').each((index, element) => {
            const iconClass = $(element).find('i').attr('class') || '';

            if (iconClass.includes('ic-16-briefcase')) {
                const experience = $(element).find('span').text().trim();
                experiences.push(experience);
            }
        });

        const salary =[];
        const sal = $('.mobile');
        $(sal).each((index,element)=>{
            salary[index]=$(element).text().trim();
        })


        const posted =[];
        const posted_on=$('.status-inactive span');
        $(posted_on).each((index,element)=>{
            posted[index]=$(element).text().trim();
        })
        
        const jobs = [];

        for (let i = 0; i < job_title.length; i++) {
            jobs.push({
                title: job_title[i] || '',
                company: company_name[i] || '',
                location: company_location[i] || '',
                experience: experiences[i] || '',
                salary: salary[i] || '',
                posted: posted[i] || ''
            });
        }

        if (jobs.length === 0) {
            res.status(404).json({ message: 'No openings found. Try a different role or location.' });
        } else {
            res.json(jobs);
        }
        

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Something went wrong while fetching jobs." });
    }
});