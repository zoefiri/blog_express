# an express blog
This is an express and postgres blog backend, it includes users, posts, and media.

The exact schema is easy to read and can be viewed [here](https://raw.githubusercontent.com/zoefiri/blog_express/main/prisma/schema.prisma)

# how to use 

## dependencies
node and postgres, the rest is in package.json :)

## environment vars
* DATABASE_URL    - postgresql://<user>:<password>@localhost:5432/blogdemo?schema=public
* JWT_SECRET      - a securely generated cryptographic secret for generating JWT tokens
* REGISTER_SECRET - a secret passphrase allowing registration

## running
just `npm start` (make sure postgres is running)
