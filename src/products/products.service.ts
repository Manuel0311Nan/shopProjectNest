import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { validate as uuid } from 'uuid';
import { isUUID } from 'class-validator';
import { ProductImage } from './entities/product-image.entity';

@Injectable()
export class ProductsService {
  //TODO Buscar Logger en CGPT
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository <ProductImage>
  ) {}



  async create(createProductDto: CreateProductDto) {
    try {
      const {images = [], ...productDetails} = createProductDto
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({url: image}))
      });
      await this.productRepository.save(product);

      return {...product, images};
    } catch (error) {
      this.handleExceptions(error);
    }
  }



  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true
      }
    });
    return products.map((product) => ({
      ...product,
      images: product.images.map(img => img.url)
    }))
  }


  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    }else{
      const querBuilder = this.productRepository.createQueryBuilder('prod')
      product = await querBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase,
          slug: term.toLowerCase
        })
        .leftJoinAndSelect('prod.images', 'prodIamges')
        .getOne();
    }

    if (!product)
      throw new NotFoundException(`Product with id ${term} not found`);

    return product;
  }

  async findOnePlain(term: string) {
    const {images = [], ...rest} = await this.findOne(term)
    return {
      ...rest,
      images: images.map( image => image.url)
    }
}

  async update(id: string, updateProductDto: UpdateProductDto) {
    //Prepara el elemento para la actualización
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto,
      images: []
    })
    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      return this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  
  }



  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
    return `Producto eliminado`;
  }



  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error');
  }
}
