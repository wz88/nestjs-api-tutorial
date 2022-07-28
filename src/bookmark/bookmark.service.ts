import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
    constructor(private prisma: PrismaService) {}

    async createBookmark(userId: number, dto: CreateBookmarkDto) {
        const bookmark = await this.prisma.bookmark.create({data: {
            userId,
            ...dto
        }})

        return bookmark
    }

    getBookmarks(userId: number) {
        return this.prisma.bookmark.findMany({where: {userId}})
    }

    getBookmarkById(userId: number, bookmarkId: number) {
        return this.prisma.bookmark.findFirst({where: {id: bookmarkId, userId}})

    }

    async editBookmarkById(userId: number, bookmarkId: number, dto: EditBookmarkDto) {
        // get bookmark by ID
        const bookmark = await this.prisma.bookmark.findUnique({where: {id: bookmarkId}})

        // check if the user owns the bookmark
        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException(
                `Bookmark with ID ${bookmarkId} does not exist or does not belong to the user with ID ${userId}`
                )

        // update the bookmark and return it
        return this.prisma.bookmark.update({
            where: {id: bookmarkId},
            data: {...dto}
        })
    }

    async deleteBookmarkById(userId: number, bookmarkId: number) {
        // get bookmark by ID
        const bookmark = await this.prisma.bookmark.findUnique({where: {id: bookmarkId}})

        // check if the user owns the bookmark
        if (!bookmark || bookmark.userId !== userId)
            throw new ForbiddenException(
                `Bookmark with ID ${bookmarkId} does not exist or does not belong to the user with ID ${userId}`
                )
        
        // delete bookmark
        await this.prisma.bookmark.delete({where: {id: bookmarkId}})
    }
}
