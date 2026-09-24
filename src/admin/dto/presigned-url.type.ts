import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType({ description: 'Presigned S3 upload URL response' })
export class PresignedUrlResponse {
  @Field(() => String, { description: 'Direct S3 PUT URL' })
  uploadUrl: string;

  @Field(() => String, { description: 'Publicly readable asset URL' })
  fileUrl: string;
}
