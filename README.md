Fast API with tortoise orm and test with AsyncClient from httpx.
The tools are same as full-fastapi-template, as it has 

api.example.com
traefik.example.com
dashboard.example.com
adminer.example.com

Backend logic differs with the template as:
-there is no signup, instead admin adds the users and users need to set up password upon the invite.
-users can't delete themselves, can't change email which should be done by admins.
-JWT token logic differs as there is authentication whether it's the dependancy token or password reset, setup tokens.

Traefik logic differs with the template as:
-it has DNS challenge with AWS Route 53 access keys rather just TLS challenge.
-regex redirection logic for naked domain to www

Later will update README with much greater detail and explanation.

Anything else want to clarify, contact me at: bobbytumur@gmail.com
