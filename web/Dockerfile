#####
# Stage 1: Development stage
FROM node:18-alpine AS development

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . .

#####
# Stage 2: Build stage
FROM development AS build

RUN REACT_APP_HOST_ENV=docker npm run build

#####
# Stage 3: Production stage 
FROM nginx:1.26-alpine AS production

# define production environment
ENV NODE_ENV=production

# set working directory
WORKDIR /usr/share/nginx/html

# copy bundled code from the build stage to the production directory
COPY --from=build /app/build /usr/share/nginx/html

# copy nginx config to production server
COPY .docker/nginx.conf /etc/nginx/conf.d/default.conf

# copy .htaccess file to production server
COPY .docker/.htaccess .

# copy injection script and make it executable
COPY .docker/env.sh /docker-entrypoint.d/
RUN chmod +x /docker-entrypoint.d/env.sh

EXPOSE 80 443

# start nginx server
CMD ["nginx", "-g", "daemon off;"]
