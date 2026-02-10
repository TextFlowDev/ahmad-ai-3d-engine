import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function GET(
    request: NextRequest,
    { params }: { params: { name: string } }
) {
    const name = params.name.replace(/\.json$/, '');

    // Try to serve from public/r/ (built registry output)
    const publicPath = join(process.cwd(), 'public', 'r', `${name}.json`);
    if (existsSync(publicPath)) {
        const content = readFileSync(publicPath, 'utf-8');
        return NextResponse.json(JSON.parse(content));
    }

    // Fallback: look up from registry.json directly
    const registryPath = join(process.cwd(), 'registry.json');
    if (!existsSync(registryPath)) {
        return NextResponse.json({ error: 'Registry not found' }, { status: 404 });
    }

    const registry = JSON.parse(readFileSync(registryPath, 'utf-8'));
    const item = registry.items.find((i: any) => i.name === name);

    if (!item) {
        return NextResponse.json({ error: `Item "${name}" not found` }, { status: 404 });
    }

    // Read the actual file content for each file in the item
    const filesWithContent = (item.files || []).map((file: any) => {
        const filePath = join(process.cwd(), file.path);
        let content = '';
        if (existsSync(filePath)) {
            content = readFileSync(filePath, 'utf-8');
        }
        return { ...file, content };
    });

    return NextResponse.json({
        ...item,
        files: filesWithContent
    });
}
