import { ApiProperty } from "@nestjs/swagger";
import { EnumStatusFile, File } from "@prisma/client";

export class FileResponse implements Partial<File>{
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    path: string;

    @ApiProperty({required: false})
    shareUrl?: string;

    @ApiProperty()
    size: number;

    @ApiProperty()
    userId: number;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty({required: false})
    parentId?: number;

    @ApiProperty()
    mimeType: string;

    @ApiProperty({required: false, enum: EnumStatusFile})
    status?: EnumStatusFile;

    @ApiProperty()
    updatedAt: Date;

    @ApiProperty({required: false})
    version?: string;    

}