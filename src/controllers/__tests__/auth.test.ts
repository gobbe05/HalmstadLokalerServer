import request from 'supertest'
import User from '../../models/userModel'
import app from '../../app'
import { clearTestDb, closeTestDb, connectTestDb } from '../../tests/testDb';

beforeAll(async () => {
    await connectTestDb();
});

afterEach(async () => {
    await clearTestDb();
});

afterAll(async () => {
    await closeTestDb();
});

describe("Auth API", () => {
    it('should create a new user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                username: "gabriel1",
                password: "test123",
                email: "gabriel@raskov.se"
            }).expect(200)
    })

    it('should login as a new user', async () => {
        const mockuser = User.create({
            username: "gabriel1",
            password: "test123",
            email: "gabriel@raskov.se"
        })

        const response = await request(app)
            .post('/auth/login')
            .send({
                username: "gabriel1",
                password: "test123"
            })
            .expect(200)
    })
})