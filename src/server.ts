import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { setInterval } from 'timers';
import { DownloadNode } from './utils/buildDownloadIndex';
import dotenv from 'dotenv';
import { downloadAllCours } from '.';
dotenv.config({ quiet: true });

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

(async () => {
    // Simple CORS for open API
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        if (req.method === 'OPTIONS') return res.sendStatus(204);
        next();
    });

    // Log all requests for debugging
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });

    // Serve the download directory statically at /download
    const downloadDir = path.resolve('download');
    app.use(
        '/download',
        express.static(downloadDir, {
            index: false,
            dotfiles: 'allow',
            setHeaders: (res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
            },
        })
    );

    // Also serve files directly from root paths (elec/, math/, etc.)
    // This allows accessing /elec/... instead of /download/elec/...
    app.use(
        '/elec',
        express.static(path.join(downloadDir, 'elec'), {
            index: false,
            dotfiles: 'allow',
            setHeaders: (res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
            },
        })
    );

    app.get('/elec/liste_cours', async (req, res) => {
        const listePath = path.join(downloadDir, 'index.json');
        try {
            const data = await fs.readFile(listePath, 'utf8');
            const index: DownloadNode[] = JSON.parse(data);
            const elecNode: DownloadNode | undefined = index.find((node: any) => node.name === 'elec');
            if (!elecNode) {
                return res.status(404).json({ error: 'Elec directory not found in index' });
            }
            res.json({ courses: elecNode });
        } catch (err) {
            console.error('Error reading elec course list:', err);
            res.status(500).json({ error: 'Unable to read elec course list' });
        }
    });

    app.use(
        '/math',
        express.static(path.join(downloadDir, 'math'), {
            index: false,
            dotfiles: 'allow',
            setHeaders: (res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
            },
        })
    );

    app.get('/math/liste_cours', async (req, res) => {
        const listePath = path.join(downloadDir, 'index.json');
        try {
            const data = await fs.readFile(listePath, 'utf8');
            const index: DownloadNode[] = JSON.parse(data);
            const mathNode: DownloadNode | undefined = index.find((node: any) => node.name === 'math');
            if (!mathNode) {
                return res.status(404).json({ error: 'Math directory not found in index' });
            }
            res.json({ courses: mathNode });
        } catch (err) {
            console.error('Error reading math course list:', err);
            res.status(500).json({ error: 'Unable to read math course list' });
        }
    });

    app.use(
        '/mecha',
        express.static(path.join(downloadDir, 'mecha'), {
            index: false,
            dotfiles: 'allow',
            setHeaders: (res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
            },
        })
    );

    app.get('/mecha/liste_cours', async (req, res) => {
        const listePath = path.join(downloadDir, 'index.json');
        try {
            const data = await fs.readFile(listePath, 'utf8');
            const index: DownloadNode[] = JSON.parse(data);
            const mechaNode: DownloadNode | undefined = index.find((node: any) => node.name === 'mecha');
            if (!mechaNode) {
                return res.status(404).json({ error: 'Mecha directory not found in index' });
            }
            res.json({ courses: mechaNode });
        } catch (err) {
            console.error('Error reading mecha course list:', err);
            res.status(500).json({ error: 'Unable to read mecha course list' });
        }
    });

    app.use(
        '/physique',
        express.static(path.join(downloadDir, 'physique'), {
            index: false,
            dotfiles: 'allow',
            setHeaders: (res) => {
                res.setHeader('Access-Control-Allow-Origin', '*');
            },
        })
    );

    app.get('/physique/liste_cours', async (req, res) => {
        const listePath = path.join(downloadDir, 'index.json');
        try {
            const data = await fs.readFile(listePath, 'utf8');
            const index: DownloadNode[] = JSON.parse(data);
            const physiqueNode: DownloadNode | undefined = index.find((node: any) => node.name === 'physique');
            if (!physiqueNode) {
                return res.status(404).json({ error: 'Physique directory not found in index' });
            }
            res.json({ courses: physiqueNode });
        } catch (err) {
            console.error('Error reading physique course list:', err);
            res.status(500).json({ error: 'Unable to read physique course list' });
        }
    });

    app.get('/', (_req, res) => {
        res.send({
            message: 'ATS downloader index API',
            endpoints: [
                '/api/index',
                '/download/*',
                '/elec/liste_cours',
                '/math/liste_cours',
                '/mecha/liste_cours',
                '/physique/liste_cours',
            ],
        });
    });

    await downloadAllCours();

    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
        console.log('GET /api/index to obtain the download index JSON');
        setInterval(
            async () => {
                console.log('Starting scheduled course download...');
                try {
                    await downloadAllCours();
                    console.log('Scheduled course download completed successfully.');
                } catch (err) {
                    console.error('Error during scheduled course download:', err);
                }
            },
            24 * 60 * 60 * 1000
        ); // Every 24 hours
    });
})();
