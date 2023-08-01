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
- Y entrar en Table Plus para visualizar los datos
5. ejecutar SEED
```
http://localhost:3000/api/seed
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
### Entidades
- Representa una tabla en tu base de datos. Las entidades suelen estar asociadas con el ORM que estas utilizando, como TypeOrm.
- Contienen propiedades que se mapean directamente a las columnas de la tabla de la BBDD
# 
### DTO
- Objetos que se utilizan para encapsular los datos, y enviarlos desde el cliente al servidor o viceversa. Los DTOs ayudan a definir que datos se pueden enviar en una solicitud o respuesta, lo que puede ayudar a mantener la coherencia y la seguridad de la aplicación, asegurando que solo se envíen los datos necesarios y esperados.
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
### Nombre de la tabla
- Modificar en los archivos "entity" dentro de la etiqueta @Entity(name: 'nombre de la tabla).
- Para cambiar el nombre de las tablas, es necesario tirar abajo el servidor docker, volverlo a levantar

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
## Comandos nestJS
1. nest g res nombre --no-spec
2. 
#
## Pasos para visualizar la nueva tabla en Table Plus desde ORM
1. Creamos en la entidad cada una de las columnas, incluyendo los decoradores
- Column,
2. En el archivo nombre.module.ts
```
  imports: [
    TypeOrmModule.forFeature([
      Nombre
    ])
  ],
    exports: [TypeOrmModule]
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
  #
  ### Eager relations
- Son una forma de definir relaciones entre entidades que siempre deben cargarse de la base de datos cuando se consulta la entidad principal.
- Importante establecer como '{eager: true}' en la definición de @OneToMany. que quiere decir que cada vez que se cargue un Product de la base de datos, TypeORM también cargará automáticamente todas las Images relacionadas con ese product
- Se debe tener cuidado con este método, ya que si se cargan muchas relaciones se puede ver afectado el rendimiento de la consulta.
  #
  ### Query runner
  - Permite ejecutar "x" cantidad de sentencias SQL, y si por el casual una fallase, se puede hacer un runner back y devolver todo a su estado anterior
    - Útil cuando necesitas más control sobre tus consultas que el que te proporciona el sistema de consulta de alto nivel de TypeORM.
    - Es la herramienta que utiliza TypeOrm para realizar migraciones de base de datos.
    #
  ### Transacciones
- Utilizamos QueryRunner para manejar transacciones de base de datos. Es útil cuando tienes varias operaciones de base de datos que necesitan realizarse juntas, y si alguna de ellas falla, no quierer que ninguna de las operaciones se realice.
    #
  ### @types/multer
  - Proporciona definiciones de tipos para multer.

```
  @Post('product')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile( @UploadedFile() file : Express.Multer.File) {
    return file
  }
```
#
### FileFilter*
- Creamos el método fileFilter para filtrar que no se utilicen extensiones que no sean de imagenes
 **fileFilter**:
 ```
export const fileFilter = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    if (!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg', 'jpeg', 'png', 'gif']
    
    if (validExtensions.includes(fileExtension)) {
        return callback(null, true)
    }

    callback(null, false);
}
 ```


**FileInterceptor** Interceptor específico provisto por @nestjs/platform-express, para manejar la subida de un archivo en una petición HTTP. Basado en la biblioteca multer. Es el tipo de datos que se utiliza generalmente para la subida de archivos en las aplicaciones web.
- Cuando se aplica este interceptor estamos diciendo "Espera una subida de un archivo en esta ruta y maneja los detalles de esa subida por mi " Dentro del parentesis, le ponemos el mismo nombre que le hayamos dado como key (en este caso en postman se le colocó file)
- Una vez subido el archivo se sube a un servidor temporal.
#
### Archivo .gitkeep
#
### Subida de archivos
- Creamos una carpeta "static" y dentro una carpeta "uploads" para las imágenes súbidas.
- A través de la etiqueta destination decidimos en que carpeta guardaremos los archivos que se manden
```
 @UseInterceptors(FileInterceptor('file', {
    fileFilter: fileFilter,
    storage: diskStorage({
      destination: './static/uploads'
    })
  }) )
```
- Renombramos los archivos, ya que se crea con un nombre alfanúmerico extraño.
  - Creamos un nuevo helper, donde como el de antes creamos una función que nos ayude a controlar aquello que se está guardando.


**fileNamer**:
 ```
import { v4 as uuid } from "uuid";

export const fileNamer = (req: Express.Request, file: Express.Multer.File, callback: Function) => {
    
    if (!file) return callback(new Error('File is empty'), false);

    const fileExtension = file.mimetype.split('/')[1];
    const fileName = `${uuid()}.${fileExtension}`;

    callback(null, fileName);
}
 ```
#
### Libreria para encriptar la contraseña
- npm i bcrypt
#
### JWT
- Módulos de registro normales
```
JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: '2h'
    }
})
```
- Módulos asíncronos
```

```