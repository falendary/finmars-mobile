FROM node:18.9

RUN mkdir -p /var/www/finmars
WORKDIR /var/www/finmars

COPY package*.json ./
RUN npm i
RUN npm install -g @ionic/cli
RUN npm install express
COPY . .

RUN npm run build

EXPOSE 8080

RUN chmod +x /var/www/finmars/docker/substitute_environment_variables.sh
ENTRYPOINT ["/var/www/finmars/docker/substitute_environment_variables.sh"]

# RUN npm run test
