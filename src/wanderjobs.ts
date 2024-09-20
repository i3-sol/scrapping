import fs, { existsSync } from 'fs';
import path, { dirname } from 'path';
import axios from 'axios';
import slugify from 'slugify';
import puppeteer from 'puppeteer';
import * as cheerio from "cheerio";

import jsonFIle from "./../data/wanderjobs/output.json"

const baseDir = path.normalize(`${__dirname}/../data/wanderjobs`);
const baseUrl = 'https://wanderjobs.com';



const getCategoriesPage = async () => {
    if (!fs.existsSync(`${baseDir}/index.html`)) {

        const res = await axios.get(`${baseUrl}/jobs/seasonal-jobs-abroad`);
        fs.writeFileSync(`${baseDir}/index.html`, res.data);

        return res.data
    } else {
        return fs.readFileSync(`${baseDir}/index.html`, 'utf-8');
    }
}
const getPage = async (url: string) => {
    if (!fs.existsSync(`${baseDir}/_${url.split('/')[url.split('/').length - 2]}.html`)) {

        const res = await axios.get(url);
        fs.writeFileSync(`${baseDir}/_${url.split('/')[url.split('/').length - 2]}.html`, res.data);

        return res.data
    } else {
        return fs.readFileSync(`${baseDir}/_${url.split('/')[url.split('/').length - 2]}.html`, 'utf-8');
    }
}


const getSubCatePage = async (url: string, i?: number) => {
    try {

        console.log(url + i)
        if (!fs.existsSync(`${baseDir}/${url.split('/')[url.split('/').length - 2]}-${i}.html`)) {

            const res = await axios.get(url + (i !== undefined ? '/page/' + i : ''));
            fs.writeFileSync(`${baseDir}/${url.split('/')[url.split('/').length - 2]}-${i}.html`, res.data);
            return res.data
        } else {
            return fs.readFileSync(`${baseDir}/${url.split('/')[url.split('/').length - 2]}-${i}.html`, 'utf-8');
        }

    } catch (error) {
        console.log(error)
    }
}

(async () => {
    let idx = 1;
    const data = [] as any[];
    for (let i of jsonFIle) {
        if (i.facebook !== '' || i.linkedIn !== '' || i.twitter !== '' || i.instagram !== '') {
            data.push({ id: idx, fullName: i.fullName, email: i.email, phoneNumber: i.phoneNumber, address: i.address, linkedIn: i.linkedIn, facebook: i.facebook, twitter: i.twitter, instagram: i.instagram })
            idx++;
        }
    }
    fs.writeFileSync(`${baseDir}/result.json`, JSON.stringify(data, null, '\t'))
    // try {
    //     const categoriesPage = await getCategoriesPage();

    //     const $ = cheerio.load(categoriesPage)
        
    //     const categories = $("aside#secondary").find('ul > li');
    //     const data = [] as any
        
    //     let idx = 1;
    //     for (let cate of categories as any) {
    //         const link = $(cate).find("a").attr("href");
    //         const subCatePage = await getSubCatePage(link);

    //         const $$ = cheerio.load(subCatePage);

    //         const navLinks = $$("div.nav-links > a").length

    //         try {
    //             for (let i = 1; i <= navLinks; i++) {
    //                 const subCatePage = await getSubCatePage(link, i);

    //                 const _$ = cheerio.load(subCatePage);

    //                 const subCategories = _$('main#main > article');

    //                 for (let subCate of subCategories as any) {
    //                     const sub_url = _$(subCate).find('a').attr('href');

    //                     const page = await getPage(sub_url);

    //                     const _$$ = cheerio.load(page);
    //                     const contact = _$$('article > div.entry-content').find('ul.wp-block-list').nextAll('ul').last().next().text();
    //                     const isPhoneNumber = contact.match(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/);
    //                     const isEmail = contact.match(/(?:[a-z0-9+!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gi)
    //                     const phoneNumber = isPhoneNumber ? isPhoneNumber[0] : ''
    //                     const email = isEmail ? isEmail[0] : ''
    //                     console.log(phoneNumber)

    //                     const _socials = _$$('article > div.entry-content').find('a');
    //                     let facebook = ''
    //                     let instagram = ''
    //                     let twitter = ''
    //                     for (let social of _socials as any) {
    //                         const socialLink = _$$(social).attr('href');

    //                         if (socialLink.includes('instagram')) {
    //                             instagram = socialLink
    //                         }
    //                         else if (socialLink.includes('facebook')) {
    //                             facebook = socialLink
    //                         }
    //                         else if (socialLink.includes('twitter')) {
    //                             twitter = socialLink
    //                         }
    //                     }
    //                     data.push({ id: idx, fullName: "", email: "", phoneNumber: "", address: "", linkedIn: "", facebook: facebook, twitter: twitter, instagram: instagram })
    //                     idx++;
    //                 }

    //             }
    //         } catch (error) {
    //             console.log(error)
    //         }

    //     }

    //     fs.writeFileSync(`${baseDir}/data.json`, JSON.stringify(data, null, '\t'))
    //     console.log('done')
    // } catch (error) {
    //     console.log(error)
    // }

})()