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
      expect(resut).rejects.toEqual({
        type: 'conflict',
        message: 'Recommendations names must be unique'
      });
    expect(recommendationRepository.create).toBeCalled();
     
	});
  it("curtir",async () => {
    
    const id =1
    //upvote(req: Request, res: Response
    const body = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y"
  };
  jest
  .spyOn( recommendationRepository, 'find')
  .mockImplementationOnce((): any => {
    return body

    
  });
   

  jest
    .spyOn(  recommendationRepository, 'updateScore')
    .mockImplementationOnce((): any => {});


   await recommendationService.upvote(+id);
  expect(recommendationRepository.updateScore).toBeCalled();

 
  
	});
  it("descurtir",async () => {
    const body = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:3
  };
  jest
  .spyOn( recommendationRepository, 'find')
  .mockImplementationOnce((): any => {
    return body

    
  });
    const id =1
    jest
    .spyOn(  recommendationRepository, 'updateScore')
    .mockImplementationOnce((): any => {
      return body
    });
    await recommendationService.downvote(+id);
    expect(recommendationRepository.updateScore).toBeCalled();
   
	});
  it("descurtir deletar",async () => {
    const body = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:-6
  };
  jest
  .spyOn( recommendationRepository, 'find')
  .mockImplementationOnce((): any => {
    return body

    
  });
    const id =1
    jest
    .spyOn(  recommendationRepository, 'updateScore')
    .mockImplementationOnce((): any => {
      return body
    });
    jest
    .spyOn(  recommendationRepository, 'remove')
    .mockImplementationOnce((): any => {
    });
    await recommendationService.downvote(+id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).toBeCalled();
    
   
	});
  it("descurtir deletar",async () => {
    const body = {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:-6
  };
  jest
  .spyOn( recommendationRepository, 'find')
  .mockImplementationOnce((): any => {
    return body

    
  });
    const id =1
    jest
    .spyOn(  recommendationRepository, 'updateScore')
    .mockImplementationOnce((): any => {
      return body
    });
    jest
    .spyOn(  recommendationRepository, 'remove')
    .mockImplementationOnce((): any => {
    });
    recommendationService.downvote(+id);
    expect(recommendationRepository.find).toBeCalled();
    expect(recommendationRepository.updateScore).toBeCalled();
    expect(recommendationRepository.remove).toBeCalled();
    
   
	});
  it("getRandom",async () => {
    const body = [ {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:-6
  }]
  
  console.log(body.length)
    jest
    .spyOn(  recommendationRepository, 'findAll')
    .mockImplementationOnce((): any => {
      return body
    });
 
    recommendationService.getRandom()
    expect(recommendationRepository.findAll).toBeCalled();
	});
  it("erro getRandom",async () => {
    const body = []
  
  console.log(body.length)
         
   
    const resut =recommendationService.getRandom()
    expect(resut).rejects.toEqual({
      type: 'not_found',
      message: ''
    });
   
	});
 
  it("get",async () => {
    const body = [ {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:-6
  }]
    jest
    .spyOn(  recommendationRepository, 'findAll')
    .mockImplementationOnce((): any => {
      return body
    });
    recommendationService.get()
    expect(recommendationRepository.findAll).toBeCalled();
	});

  it("get top",async () => {
    const amount=1
    const body = [ {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:-6
  }]
    jest
    .spyOn(  recommendationRepository, 'getAmountByScore')
    .mockImplementationOnce((): any => {});
    recommendationService.getTop(+amount)
    //getAmountByScore
    expect(recommendationRepository.getAmountByScore).toBeCalled();
	});
  it("getById",async () => {
    const id=1
    const body = [ {
      name: "Falamansa - Xote dos Milagres",
      youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
      score:-6
  }]
    jest
    .spyOn(  recommendationRepository, 'find')
    .mockImplementationOnce((): any => {
      return body
    });
    recommendationService.getById(+id)
    //getAmountByScore
    expect(recommendationRepository.find).toBeCalled();
	});
  it("getById erro",async () => {
    const id=1
    const body =''
    jest
    .spyOn(  recommendationRepository, 'find')
    .mockImplementationOnce((): any => {
      return body
    });
    const result= recommendationService.getById(+id)
    //getAmountByScore
    expect(recommendationRepository.find).toBeCalled();
    console.log('result')
    console.log(result)
    expect(result).rejects.toEqual({
      type: 'not_found',
      message: ''
    });
   
	});



});