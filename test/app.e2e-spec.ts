import * as pactum from 'pactum'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { PrismaService } from '../src/prisma/prisma.service'
import { AppModule } from '../src/app.module'
import { AuthDto } from '../src/auth/dto'
import { EditUserDto } from '../src/user/dto'
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto'

describe('App e2e', () => {
  let app: INestApplication
  let prisma: PrismaService
  
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule]
    }).compile()
    
    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init()
    await app.listen(3334)

    prisma = app.get(PrismaService)
    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3334',)
  })

  afterAll(() => {
    app.close()
  })

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'test@gmail.com',
      password: '123',
      firstName: 'test',
      lastName: 'user'
    }
    describe('Signup', () => {
      it('should throw if email is empty', () => {
        return pactum
        .spec()
        .post('/auth/signup')
        .withBody({password: dto.password})
        .expectStatus(400)
      })
      it('should throw if password is empty', () => {
        return pactum
        .spec()
        .post('/auth/signup')
        .withBody({email: dto.email})
        .expectStatus(400)
      })
      it('should throw if no body is provided', () => {
        return pactum
        .spec()
        .post('/auth/signup')
        .expectStatus(400)
      })
      it('should signup', () => {
        return pactum
        .spec()
        .post('/auth/signup')
        .withBody(dto)
        .expectStatus(201)
      })
    })
    describe('Signin', () => {
      let accessToken: string

      it('should throw if email is empty', () => {
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody({password: dto.password})
        .expectStatus(400)
      })
      it('should throw if password is empty', () => {
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody({email: dto.email})
        .expectStatus(400)
      })
      it('should throw if no body is provided', () => {
        return pactum
        .spec()
        .post('/auth/signin')
        .expectStatus(400)
      })
      it('should signin', () => {
        return pactum
        .spec()
        .post('/auth/signin')
        .withBody({
          email: dto.email,
          password: dto.password,
          firstName: undefined,
          lastName: undefined
        })
        .expectStatus(202)
        .stores('userAccessToken', 'access_token')
      })
    })
  })

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
        .spec()
        .get('/users/me')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .expectStatus(200)
      })
    })
    describe('Edit user', () => {
      const dto: EditUserDto = {
        firstName: "e2e test",
        email: "test@test.com"
      }
      it('should edit user', () => {
        return pactum
        .spec()
        .patch('/users')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .withBody(dto)
        .expectStatus(200)
        .expectBodyContains(dto.firstName)
        .expectBodyContains(dto.email)
      })
    })
  })

  describe('Bookmark', () => {
    let createDto: CreateBookmarkDto = {
      title: "Test bookmark",
      link: "http://test.bookmark.co"
    }

    let editDto: EditBookmarkDto = {
      title: "Updated test bookmark",
      description: "This is a testing bookmark. It is used for e2e testing!"
    }

    describe('Get empty bookmarks before', () => {
      it('should get empty bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .expectStatus(200)
        .expectBody([])
      })
    })
    describe('Create bookmark', () => {
      it('should create a bookmark', () => {
        return pactum
        .spec()
        .post('/bookmarks')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .withBody(createDto)
        .expectStatus(201)
        .stores('bookmarkId', 'id')
      })
    })
    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .expectStatus(200)
        .expectJsonLength(1)
      })
    })
    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
        .spec()
        .get('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
      })
    })
    describe('Edit bookmark', () => {
      it('should edit bookmark by id', () => {
        return pactum
        .spec()
        .patch('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .withBody(editDto)
        .expectStatus(200)
        .expectBodyContains('$S{bookmarkId}')
        .expectBodyContains(editDto.title)
        .expectBodyContains(editDto.description)
      })
    })
    describe('Delete bookmark', () => {
      it('should delete bookmark by id', () => {
        return pactum 
        .spec()
        .delete('/bookmarks/{id}')
        .withPathParams('id', '$S{bookmarkId}')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .expectStatus(204)
      })
    })
    describe('Get empty bookmarks after', () => {
      it('should get empty bookmarks', () => {
        return pactum
        .spec()
        .get('/bookmarks')
        .withHeaders({Authorization: 'Bearer $S{userAccessToken}'})
        .expectStatus(200)
        .expectBody([])
      })
    })
  })
})