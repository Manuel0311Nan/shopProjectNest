<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

<!-- control + shift + p open preview para previsualizar archivo Readme --> 

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```
npm install
```

## Running the app
### watch mode
```
npm run start:dev
```
2. 
```
Clonar el archivo ```.env.template``` y renombrarlo a ```.env```
```
3. 
```
Cambiar las variables de entorno
```
## TesloDB API con docker y postgres. Visualización a traves de  "table plus"
4. Levantar base de datos
```
docker-compose up
```

# Description of TypeOrm Use
### Abstracción de la base de datos
```
Permite a los desarrolladores trabajar con la base de datos utilizando objetos y métodos en lugar de escribir consultas SQL a mano.
Centrándose en la lógica de la aplicación en lugar  de preocuparse en los detalles específicos de la base de datos
```
### Soporte para varios SGBD
```
Compatible con varios sistemas de gestión de base de datos ( MySQL, PosteSQL, SQLite y MongoDB).
Los desarrolladores pueden cambiar de base de datos sin tener que reescribir gran parte del código de la app.
```
### Integración con TypeScript
```
Compatibilidad que permite a los desarrolladores utilizar tipos estáticos, mejorar la calidad del código y reducir la probabilidad de errores.
```
### Decoradores
```
Hace uso extensivo de los decoradores de Typescript. Que permiten definir cómo se mapean las clases y los campos de las clases a las tablas y columnas de la BBDD
```
### Migraciones
```
Admite migraciones de BBDD, lo que permite a los desarrolladores realizar cambios en la estructura de la base de datos de manera controlada.
```
### Active Record y Data Mapper
```
Soporta ambos patrones de diseño, brindando a los desarrolladores la flexibilidad de elegir el que mejor se adapte a sus necesidades
```
### Carga Eager y Lazy
```
Admite tanto la carga eager como la lazy para las relaciones, lo que puede ayudar a mejorar el rendimiento de las aplicaciones al permitir a los desarrolladores controlar cuándo se cargan los datos relacionados.
```
#
## Configuración typeorm - BBDD 

### products.module.ts
```
  TypeOrmModule.forFeature([
      Product
    ])
```
### app.module.ts
```
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
```
### Product Entity
```
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product { 

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    title: string;
}
```
#
### ProductRepository
- Este repositorio proporciona métodos para interactuar con la tabla  'Product' (en este caso) en tu base de datos.
  - @InjectRepository(Product) - Solicita que un repositorio para el modelo 'Product' se inyecte en este servicio.
  ```
   constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>
  )
  ```
  ### visualizar el código de error y modificarlo a uno más conocido
  - Creamos una función que controle los errores que nos dan por consola.
  ```
  private handleExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error');
  }
  ```
#
## BeforeInsert
- Permite controlar el valor que se va a mandar a una de las columnas si por algún casual se envia vacio.
```
   @BeforeInsert()
    checkSlug(){
        if (!this.slug) {
            this.slug = this.title
                .toLowerCase()
                .replaceAll(' ', '_')
                .replaceAll("'", ' ');
        } else {
            this.slug = this.slug
            .toLowerCase()
            .replaceAll(' ', '_')
            .replaceAll("'", ' ');
        }
}
```
# Create Query Builder
- Método que ofrece  repository de typeorm para realizar instancias de sql
Parte del else:
```
  if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    }else{
      const querBuilder = this.productRepository.createQueryBuilder()
      product = await querBuilder
        .where('title = :title or slug = :slug', {
          title: term,
          slug: term
        }).getOne();
    }
```
    Hay que restructurar el código para que haya una coincidencia ( mayúsculas o minúsculas) a la hora de buscar.

```
    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    }else{
      const querBuilder = this.productRepository.createQueryBuilder()
      product = await querBuilder
        .where('UPPER(title) = :title or slug = :slug', {
          title: term.toUpperCase,
          slug: term.toLowerCase
        }).getOne();
    }
```
# Update elements
- Precargamos el elemento a editar.
- Controlamos los errores con la función handleExceptions
Y sobrescribimos con los datos nuevos
```
  async update(id: string, updateProductDto: UpdateProductDto) {
    //Prepara el elemento para la actualización
    const product = await this.productRepository.preload({
      id: id,
      ...updateProductDto
    })
    if (!product) throw new NotFoundException(`Product with id: ${id} not found`);

    try {
      return this.productRepository.save(product);
    } catch (error) {
      this.handleExceptions(error);
    }
  
  }
```
Podemos checkear la actualización de elementos directamente mediante el decorador **@Beforeupdate**, método parecido a Before Insert


# Sección:  Relaciones en TypeORM
### OneToMany, ManyToOne, ManyToMany
Se busca un relación de uno a muchos en el caso de los productos que ya tenemos y una relación de muchos a uno desde la tabla de imágenes.

1. En primer lugar para crear la nueva tabla de imágenes:
- Se crea una nueva entidad dentro de la carpeta de productos ya que guardan esa relación entre las tablas.
2. Agregamos al archivo products.module.ts, dentro del método forFeature del módulo TypeOrmModule, la entidad creada, para que automaticamente se cree la tabla en nuestra BBDD
3. Posibilidad de crear un archivo "Barril" donde se incluyen las exportaciones de todas las entidades para que en el archivo products.module.ts sólo aparezca un archivo importado. En este caso se debe denomina como index.ts. Conveniente si se tienen muchas entidades (desde 4 o 5, en mi opinión)
4. Crear la relación entre las tablas:
- Añadir la columna con la columna que vamos a relacionar, a cada una de las entidades.
- En este caso no utilizamos el método @Column, para crear una columna si no que elegimos el tipo de relación que va a tener con la otra table
  - ManytoOne()
  - ManyToMany()
  - OneToMany()


