# s24_team_21
Repository for s24_team_21

## SocialApp setup in local environment
1. Configure Site Domain:
Go to your Django Admin (http://localhost:8000/admin).
Navigate to the "Sites" section. 
Make sure we have a domain name 'localhost:8000', if not, add it.
2. Create SocialApp in Django Admin:
Navigate to the "Social applications" section (under "Social Accounts").
Click on "Add Social Application".
Select the "Provider" (choose "Google" from the dropdown).
Give it a "Name" that will help you identify it within the admin (e.g., "Google API").
Fill in the "Client id" and "Secret key" with the values obtained from the Google Developer Console.
In the "Sites" section, add your site localhost:8000 for local development.
Save the new SocialApp.
3. Update Your settings.py:
Ensure the SITE_ID in your settings.py matches the ID of the site you've configured in the admin. The SITE_ID will differ from each other due to the difference in databases. Usually Django admin will have a default site 'example.com'. Hence, adding another 'localhost:8000' will result in it's corresponding site id to be 2. According to the newly commited version, I found SITE_ID=3 works, and have already commit the new setting to Github. You can just try it after setting the configuration in Djago Admin.
```
SITE_ID = 3
```

## Test PayPal Checkout
If you want to test on PayPal Checkout, please use the following sandbox account:

personal account 1: fakepersonalaccount@gmail.com
pwd: fakepersonalaccount

personal account 2: fakeselleraccount@gmail.com
pwd: fakeselleraccount

You can also login to sandbox.paypal.com with aforementioned account to see transactions with PayPal.
Also feel free to create your own sandbox account in paypal developer site!
