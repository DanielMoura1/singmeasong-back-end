import app from '../src/app';
import supertest from 'supertest';
import { prisma } from '../src/database';
import { recommendationService } from "../src/services/recommendationsService.js"
import {  recommendationRepository} from "../src/repositories/recommendationRepository.js"
beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
  });
  afterAll(async () => {
    await prisma.$disconnect();
});
describe("POST /tasks",  () => {
    // ...

    it("criar a musica", async () => {
        const body = {
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };
        const result = await supertest(app).post("/recommendations").send(body);
        const musica = await prisma.recommendation.findFirst({
            where: { youtubeLink:  body.youtubeLink}
          });
      
        const status = result.status;
        expect(status).toEqual(201);
        expect(musica).not.toBeNull();
    });
    it("curtir a musica", async () => {
        const body = {
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };
        await prisma.recommendation.create({
            data: body,
          });
        
        const musica = await prisma.recommendation.findFirst({
            where: { youtubeLink:  body.youtubeLink}
          });
      
        const result = await supertest(app).post(`/recommendations/${musica.id}/upvote`)
        const musica2 = await prisma.recommendation.findFirst({
            where: { youtubeLink:  body.youtubeLink}
          });
      
        const status = result.status;
        expect(status).toEqual(200);
        expect(musica2.score).toEqual(musica.score+1);
    });
    it("descurtir a musica", async () => {
        const body = {
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };
        await prisma.recommendation.create({
            data: body,
          });
        
        const musica = await prisma.recommendation.findFirst({
            where: { youtubeLink:  body.youtubeLink}
          });
      
        const result = await supertest(app).post(`/recommendations/${musica.id}/downvote`)
        const musica2 = await prisma.recommendation.findFirst({
            where: { youtubeLink:  body.youtubeLink}
          });
      
        const status = result.status;
        expect(status).toEqual(200);
        expect(musica2.score).toEqual(musica.score-1);
    });
    // ...
});

describe("GET /tasks",  () => {
    it("pegar as musicas", async () => {
        const result = await supertest(app).get(`/recommendations`)
        console.log(result.body[0])
        expect(result.body).not.toBeNull();
        
    });
    it("pegar uma musica", async () => {
        const body = {
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };
        await prisma.recommendation.create({
            data: body,
          });
          const musica = await prisma.recommendation.findFirst({
            where: { youtubeLink:  body.youtubeLink}
          });
      
        const result = await supertest(app).get(`/recommendations/${musica.id}`)
        expect(result.body).not.toBeNull();
        
    });
    it("pegar musicas aleatoria", async () => {
        const result = await supertest(app).get(`/recommendations/random`)
        expect(result.body).not.toBeNull();
        
    });
});
describe("fun", () => {
	it("criar a musica",async () => {
		const body = {
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };
		    jest
      .spyOn(  recommendationRepository, 'findByName')
      .mockImplementationOnce((): any => {});

    jest
      .spyOn(  recommendationRepository, 'create')
      .mockImplementationOnce((): any => {})
		await recommendationService.insert(body);
      console.log(recommendationRepository.findByName)
    expect(recommendationRepository.findByName).toBeCalled();
    expect(recommendationRepository.create).toBeCalled();
     
	});
  it("nao deve permitir criar uma musica que ja exista no banco",async () => {
		const body = {
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
        };
		    jest
      .spyOn(  recommendationRepository, 'findByName')
      .mockImplementationOnce((): any => {
        return body
      });

    jest
      .spyOn(  recommendationRepository, 'create')
      .mockImplementationOnce((): any => {})
		const resut = recommendationService.insert(body);
      console.log(recommendationRepository.findByName)
      //throw conflictError("Recommendations names must be unique");
      expect(resut).rejects.toEqual({
        type: 'conflict',
        message: 'Recommendations names must be unique'
      });
    expect(recommendationRepository.create).toBeCalled();
     
	});
});