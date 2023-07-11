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
  - @InjectRepository(ÇProduct) - Solicita que un repositorio para el modelo 'Product' se inyecte en este servicio.
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

