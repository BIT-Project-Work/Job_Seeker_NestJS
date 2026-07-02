import request from 'supertest';

export async function applyJob(
    app,
    accessToken: string,
    jobId: string,
) {
    return request(app.getHttpServer())
        .post(`/v2/applications/${jobId}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);
}