import { VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform/transform.interceptor';
import { HttpExceptionFilter } from './common/exceptions/http.exception/http.exception.filter';
import { AllExceptionsFilter } from './common/exceptions/base.exception/base.exception.filter';
import { generateDocument } from './doc';
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // 接口版本化管理
  app.enableVersioning({
    // set default version to 1
    // defaultVersion: '1', 
    // 针对一些接口做兼容性的更新，而其他的请求是不需要携带版本
    // 又或者请求有多个版本的时候，而默认请求想指定一个版本的话
    defaultVersion: [VERSION_NEUTRAL, '1', '2'],
    type: VersioningType.URI,
  });
  // 定义全局异常过滤器
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());
  // 定义全局拦截器，将返回值进行标准化处理
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // 创建项目文档
  generateDocument(app) 

  // 添加HMR机制
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  await app.listen(3000);
}
bootstrap();

