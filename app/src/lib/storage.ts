import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID!,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!
    },
    forcePathStyle: true
});

const BUCKET = process.env.S3_BUCKET || 'renderforge-models';

export async function getUploadUrl(key: string, contentType: string): Promise<string> {
    const command = new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        ContentType: contentType
    });
    return getSignedUrl(s3, command, { expiresIn: 3600 });
}

export async function getDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
        Bucket: BUCKET,
        Key: key
    });
    return getSignedUrl(s3, command, { expiresIn: 86400 });
}

export async function uploadBuffer(key: string, buffer: Buffer, contentType: string) {
    await s3.send(new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType
    }));
    return getPublicUrl(key);
}

export async function deleteFile(key: string) {
    await s3.send(new DeleteObjectCommand({
        Bucket: BUCKET,
        Key: key
    }));
}

export function getPublicUrl(key: string): string {
    if (process.env.S3_ENDPOINT) {
        return `${process.env.S3_ENDPOINT}/${BUCKET}/${key}`;
    }
    return `https://${BUCKET}.s3.${process.env.S3_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

export function getStorageKey(userId: string, type: 'input' | 'model' | 'thumbnail', filename: string): string {
    const timestamp = Date.now();
    return `${userId}/${type}/${timestamp}-${filename}`;
}
