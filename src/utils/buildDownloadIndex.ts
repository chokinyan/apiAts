import fs from 'fs/promises';
import path from 'path';

export interface DownloadNode {
    name: string;
    path: string;
    files: string[];
    children: DownloadNode[];
}

async function buildNode(dirPath: string): Promise<DownloadNode> {
    const name = path.basename(dirPath);
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files: string[] = [];
    const children: DownloadNode[] = [];

    for (const entry of entries) {
        const full = path.join(dirPath, entry.name);
        if (entry.isFile()) {
            files.push(entry.name);
        } else if (entry.isDirectory()) {
            children.push(await buildNode(full));
        }
    }

    return {
        name,
        path: path.resolve(dirPath).split('download').pop()?.split(path.sep).join('/').substring(1) || '',
        files,
        children,
    };
}

/**
 * Scans the given base directory and writes an index JSON file.
 * @param baseDir Relative or absolute path to the download directory (default: './download')
 * @param outFile Output JSON file path (optional). If not provided, writes to `${baseDir}/index.json`.
 */
export async function buildDownloadIndex(
    baseDir: string = path.resolve('download'),
    outFile?: string
): Promise<DownloadNode[]> {
    const absBase = path.resolve(baseDir);
    try {
        const stat = await fs.stat(absBase);
        if (!stat.isDirectory()) throw new Error(`${absBase} is not a directory`);
    } catch {
        throw new Error(`Base directory not found: ${absBase}`);
    }

    const entries = await fs.readdir(absBase, { withFileTypes: true });
    const nodes: DownloadNode[] = [];

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const full = path.join(absBase, entry.name);
            nodes.push(await buildNode(full));
        }
    }

    const outputPath = outFile ? path.resolve(outFile) : path.join(absBase, 'index.json');
    await fs.writeFile(outputPath, JSON.stringify(nodes, null, 2), 'utf8');
    return nodes;
}

// CLI support (detect if script is likely executed directly)
const _isCli = process.argv.some((a) => /buildDownloadIndex(\.js|\.ts)?$/.test(a));
if (_isCli) {
    (async () => {
        try {
            const base = process.argv[2] || 'download';
            const out = process.argv[3];
            const nodes = await buildDownloadIndex(base, out);
            console.log(`Wrote index for ${nodes.length} top-level folders to ${out || path.join(base, 'index.json')}`);
        } catch (error) {
            console.error('Error building download index:', error);
            process.exit(1);
        }
    })();
}

export default buildDownloadIndex;
