import fs from 'fs';
import axios from 'axios';
import { GoogleDrive } from '../types/drive';

async function downloadMath(): Promise<void> {
    if (!fs.existsSync(`Newdownload/math`)) {
        fs.mkdirSync(`Newdownload/math`);
    }
    const reponse = await axios
        .get(
            `https://www.googleapis.com/drive/v3/files?q='1OpNuhFpUNJ-cBJNjsl71CkjhxSDsAUXS'+in+parents&key=${process.env.GOOGLE_DRIVE_API_KEY}`
        )
        .catch((err) => {
            console.log(err);
        });
    if (!reponse) return;
    const data: GoogleDrive.DriverResponse = reponse.data;
    for (const file of data.files) {
        const fileResponse = await axios
            .get(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${process.env.GOOGLE_DRIVE_API_KEY}`,
                {
                    responseType: 'arraybuffer',
                }
            )
            .catch((err) => {
                console.log(err);
            });
        if (!fileResponse) return;
        if (!fs.existsSync(`Newdownload/math/khole`)) {
            fs.mkdirSync(`Newdownload/math/khole`);
        }
        fs.writeFileSync(`Newdownload/math/khole/${file.name}`, fileResponse.data);
    }

    const reponse2 = await axios
        .get(
            `https://www.googleapis.com/drive/v3/files?q='1bM0hGBsLs1mFK0XdUP8ezRlLhmlDSTS1'+in+parents&key=${process.env.GOOGLE_DRIVE_API_KEY}`
        )
        .catch((err) => {
            console.log(err);
        });
    if (!reponse2) return;
    const data2: GoogleDrive.DriverResponse = reponse2.data;
    for (const file of data2.files) {
        const fileResponse = await axios
            .get(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${process.env.GOOGLE_DRIVE_API_KEY}`,
                {
                    responseType: 'arraybuffer',
                }
            )
            .catch((err) => {
                console.log(err);
            });
        if (!fileResponse) return;
        if (!fs.existsSync(`Newdownload/math/exercices`)) {
            fs.mkdirSync(`Newdownload/math/exercices`);
        }
        fs.writeFileSync(`Newdownload/math/exercices/${file.name}`, fileResponse.data);
    }

    const reponse3 = await axios
        .get(
            `https://www.googleapis.com/drive/v3/files?q='1OxfoBexb5b-AxHG9cuNvhTA1smaqgLxG'+in+parents&key=${process.env.GOOGLE_DRIVE_API_KEY}`
        )
        .catch((err) => {
            console.log(err);
        });
    if (!reponse3) return;
    const data3: GoogleDrive.DriverResponse = reponse3.data;
    for (const file of data3.files) {
        const fileResponse = await axios
            .get(
                `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media&key=${process.env.GOOGLE_DRIVE_API_KEY}`,
                {
                    responseType: 'arraybuffer',
                }
            )
            .catch((err) => {
                console.log(err);
            });
        if (!fileResponse) return;
        if (!fs.existsSync(`Newdownload/math/cours`)) {
            fs.mkdirSync(`Newdownload/math/cours`);
        }
        fs.writeFileSync(`Newdownload/math/cours/${file.name}`, fileResponse.data);
    }
}

export { downloadMath };
