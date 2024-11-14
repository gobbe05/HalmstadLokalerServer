// __tests__/office.test.ts
import request from 'supertest';
import app from '../../app'; // Import your Express app here
import { connectTestDb, closeTestDb, clearTestDb } from '../../tests/testDb';
import Office from '../../models/officeModel';
import { TEST_USER_ID } from '../../config';

beforeAll(async () => {
    await connectTestDb();
    
});

afterEach(async () => {
    await clearTestDb();
});

afterAll(async () => {
    await closeTestDb();
});

describe("Office GET API", () => {
    it('should retrieve one office', async () => {
        const office = await Office.create({ name: 'Sample Office', location: 'Uptown', position: {lng: 10, lat: 10}, price: 2000, size: 130, owner: TEST_USER_ID });
        const response = await request(app).get('/api/office/' + office._id).expect(200)

        expect(response.body.office).toHaveProperty('name', 'Sample Office');
        expect(response.body.office).toHaveProperty('location', 'Uptown');
        expect(response.body.office).toHaveProperty('position', {lng: 10, lat: 10});
        expect(response.body.office).toHaveProperty('price', 2000);
        expect(response.body.office).toHaveProperty('size', 130);
        expect(response.body.office).toHaveProperty('owner', TEST_USER_ID);
    })
    it('should retrieve all offices', async () => {
        // Insert sample data directly into the test database
        await Office.create({ name: 'Sample Office', location: 'Uptown', position: {lng: 10, lat: 10}, price: 2000, size: 130, owner: TEST_USER_ID });
        await Office.create({ name: 'Sample Office2', location: 'Uptown', position: {lng: 10, lat: 10}, price: 2000, size: 130, owner: TEST_USER_ID });

        const response = await request(app).get('/api/office').expect(200);
        expect(response.body.offices).toHaveLength(2);
        expect(response.body.offices[0]).toHaveProperty('name', 'Sample Office');
        expect(response.body.offices[1]).toHaveProperty('name', 'Sample Office2');

    });

    it('should return 404 for an unknown office ID', async () => {
        const invalidId = '507f1f77bcf86cd799439011'; // Random ObjectId
        const response = await request(app).get(`/api/office/${invalidId}`).expect(404);
        expect(response.body).toHaveProperty('status', 'Not Found');
    });
});
describe('Office POST API', () => {
    it('should create a new office', async () => {
        const response = await request(app)
            .post('/api/office')
            .send({
                name: 'Main Office',
                location: 'Downtown',
                position: {lng: 10, lat:10},
                price: 1500,
                size: 120
            })
            .expect(201); // Expect HTTP 201 Created

        expect(response.body).toHaveProperty('status', 'Created Successful');
        expect(response.body.office).toHaveProperty('name', 'Main Office');
    });

    it('should test that name is required', async () => {
        const response = await request(app)
            .post('/api/office')
            .send({
                location: 'Downtown',
                position: {lng: 10, lat:10},
                price: 1500,
                size: 120
            })
            .expect(400); // Expect HTTP 201 Created

        expect(response.body).toHaveProperty('status', 'Bad Request');
    });

    it('should test that location is required', async () => {
        const response = await request(app)
            .post('/api/office')
            .send({
                name: 'Main Office',
                position: {lng: 10, lat:10},
                price: 1500,
                size: 120
            })
            .expect(400); // Expect HTTP 201 Created

        expect(response.body).toHaveProperty('status', 'Bad Request');
    });

    it('should test that size is required', async () => {
        const response = await request(app)
            .post('/api/office')
            .send({
                name: 'Main Office',
                location: 'Downtown',
                position: {lng: 10, lat:10},
                price: 1500,
            })
            .expect(400); // Expect HTTP 201 Created

        expect(response.body).toHaveProperty('status', 'Bad Request');
    });

    it('should test that position is required', async () => {
        const response = await request(app)
            .post('/api/office')
            .send({
                name: 'Main Office',
                location: 'Downtown',
                price: 1500,
                size: 120
            })
            .expect(400); // Expect HTTP 201 Created

        expect(response.body).toHaveProperty('status', 'Bad Request');
    });
});
