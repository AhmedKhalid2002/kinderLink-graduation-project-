import joi from 'joi';
export const addRequest=joi.object(
    {
        parentName:joi.string().min(5).max(30).required(),
        email:joi.string().email().required(),
        password:joi.string().min(8).max(20).required(),
        rePassword:joi.string().valid(joi.ref("password")).required(),
        phone:joi.string().pattern(/^(010|011|012|015)(\d){8}$/).required(),
        location:joi.string().min(10).max(50).required(),
        parentNationalId:joi.string().pattern(/^(\d){14}$/).length(14).required(),
        job:joi.string().min(3).max(40).required(),
        childName:joi.string().min(5).max(40).required(),
        birthDate:joi.date().required(),
        childNationalId:joi.string().pattern(/^(\d){14}$/).required(),
        region:joi.string().valid("Zamalek", "Maadi", "Mohandessin", "Garden City", "Dokki", "Heliopolis", "Nasr City", "Downtown Cairo Wust El Balad", "Agouza", "Manial", "El Rehab City", "New Cairo", "Ain Shams", "Shubra", "Helwan", "Sayeda Zeinab", "Abbassiya", "Rod El-Farag", "Shorouk City", "Darb al-Ahmar", "Bab al-Louq", "Giza Square", "Giza Corniche", "Imbaba", "El Marg", "El Basatin", "El Matareya", "El Zaher", "El Tebeen", "El Salam City", "El Sayeda Zainab", "El Khalifa", "El Nozha", "El Masara", "El Sahel", "El Khanka", "El Manyal", "El Darassa", "El Sahel", "El Basateen", "El Waily", "El Waili", "El Tebeen", "El Kholafaa El Rashedeen", "El Mosheer", "El Katameya", "El Qahira", "El Maasara", "Bulaq", "Dar El Salam", "El Omraneya", "El Agouzah", "El Matariya", "El Warraq", "El Zawya El Hamra", "Hadayek El Ahram", "Hadayek Helwan", "Hadayek El Kobba", "Hadayek El Maadi", "Helwan City", "Mokattam", "El Sharabeya", "El Marg", "El Zeitoun", "El Khalifa", "El Gamaliya", "El Moski", "El Khalifa", "El Sawah", "El Darb El Ahmar","El Doki El Nassr", "El Giza El Bahriya", "El Basatin El Gharbiya", "El Basatin El Sharkiya", "El Salam City El Gedida", "El Moneeb", "El Waily El Gedida", "El Sawah", "El Haggana", "El Marj", "El Quba", "El Qanatir El Khayriya", "El Agouza El Gedida", "El Ibrahimeya", "El Omraniya", "El Tawfiqiya", "El Khasos", "El Darasa", "El Manshiya El Gedida", "El Marg El Gedida").required(),
    }
).required();
export const activationVaalidate=joi.object({
    email:joi.string().email().required(),
}).required();
export const loginSchema=joi.object({
email:joi.string().email().required(),
password:joi.string().required(),
}).required();
export const upadateDataRequestAndEmail=joi.object({
    emaill:joi.string().email(),
    parentName:joi.string().min(5).max(50),
    phone:joi.string().pattern(/^(010|011|015|012)(\d){7,8}$/),
    location:joi.string().min(10).max(100),
    parentNationalId:joi.string().length(14),
    job:joi.string().min(3).max(100),
    childName:joi.string().min(7).max(80),
    birthDate:joi.date(),
    childNationalId:joi.string().length(14),
}).required();
export const forgetPassSchema=joi.object({
    email:joi.string().email().required(),
}).required();
export const getCodeSchema=joi.object({
    email:joi.string().required(),
    code:joi.string().length(5).required(),
    password:joi.string().min(8).max(20).required(),
    rePass:joi.string().valid(joi.ref("password")).required(),
}).required();
export const updatePasswordSchema=joi.object({
    oldPassword:joi.string().required(),
    newPassword:joi.string().min(8).max(20).required(),
    rePass:joi.string().valid(joi.ref("newPassword")).required(),
}).required()
