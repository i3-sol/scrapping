import fs, { existsSync } from 'fs';
import path, { dirname } from 'path';
import axios from 'axios';
import slugify from 'slugify';
import puppeteer from 'puppeteer';
import * as cheerio from "cheerio";

import jsonFIle from "./../data/wanderjobs/output.json"

const baseDir = path.normalize(`${__dirname}/../data/ycombinator`);
const baseUrl = 'https://www.ycombinator.com';

const getCategoriesPage = async (u: string) => {
    return fs.readFileSync(`${baseDir}/${u}`, 'utf-8')
}

const getPage = async (link: string) => {
    const uri = link.split('/')[link.split('/').length - 1]
    if (!fs.existsSync(`${baseDir}/data/${uri}.html`)) {
        const res = await axios.get(`${baseUrl}/${link}`);
        fs.writeFileSync(`${baseDir}/data/${uri}.html`, res.data)
        return res.data
    } else {
        return fs.readFileSync(`${baseDir}/data/${uri}.html`)
    }
}

(async () => {

    const uris = fs.readdirSync(`${baseDir}`);
    let idx = 1;
    const result = [] as any[];

    for (let u of uris) {
        if (u === 'data') continue
        const html = await getCategoriesPage(u);

        const $ = cheerio.load(html);

        const categories = $('div._results_86jzd_326 > a._company_86jzd_338');

        for (let cate of categories as any) {
            try {
                const link = $(cate).attr('href');
                if (link === '/companies/11874') continue;
                const htmlPage = await getPage(link);
                const _$ = cheerio.load(htmlPage);
                // const card = _$('div.ycdc-card');
                // let linkedin = ''
                // let twitter = ''
                // let facebook = ''
                // let instagram = ''
                // let crunchbase = ''
                // let github = ''

                // const socials = _$(card).find('div.space-x-2 > a')

                // for (let s of socials as any) {
                //     const socialLink = _$(s).attr('href')
                //     if (socialLink.includes('linkedin')) {
                //         linkedin = socialLink
                //     } else if (socialLink.includes('twitter')) {
                //         twitter = socialLink
                //     } else if (socialLink.includes('facebook')) {
                //         facebook = socialLink
                //     } else if (socialLink.includes('crunchbase')) {
                //         crunchbase = socialLink
                //     } else if (socialLink.includes('github')) {
                //         github = socialLink
                //     } else if (socialLink.includes('instagram')) {
                //         instagram = socialLink
                //     }
                // }

                // result.push({
                //     id: idx,
                //     fullName: '',
                //     email: '',
                //     address: "",
                //     linkedin: linkedin,
                //     twitter: twitter,
                //     facebook: facebook,
                //     instagram: instagram,
                //     crunchbase: crunchbase,
                //     github: github,
                // })
                // idx++
                let founders = _$('div.space-y-4 > div');
                if (founders.length === 0) {
                    founders = _$('div.space-y-5 > div');
                }

                for (let founder of founders as any) {
                    const fullName = $(founder).find('div.font-bold').text();
                    let _linkedin = ''
                    let _twitter = ''
                    let _facebook = ''
                    let _instagram = ''
                    let _crunchbase = ''
                    let _github = ''

                    const _socials = _$(founder).find('a')

                    for (let s of _socials as any) {
                        const _socialLink = _$(s).attr('href')
                        if (_socialLink.includes('linkedin')) {
                            _linkedin = _socialLink
                        } else if (_socialLink.includes('twitter')) {
                            _twitter = _socialLink
                        } else if (_socialLink.includes('facebook')) {
                            _facebook = _socialLink
                        } else if (_socialLink.includes('crunchbase')) {
                            _crunchbase = _socialLink
                        } else if (_socialLink.includes('github')) {
                            _github = _socialLink
                        } else if (_socialLink.includes('instagram')) {
                            _instagram = _socialLink
                        }
                    }
                    result.push({
                        id: idx,
                        fullName: fullName,
                        email: '',
                        address: '',
                        linkedin: _linkedin,
                        twitter: _twitter,
                        facebook: _facebook,
                        instagram: _instagram,
                        crunchbase: _crunchbase,
                        github: _github,
                    })

                    idx++
                }
            } catch (error) {
                console.log(error)
                console.log(error)
            }
        }
    }

    fs.writeFileSync(`${baseDir}/_data.json`, JSON.stringify(result, null, '\t'))
    console.log('done')
})()