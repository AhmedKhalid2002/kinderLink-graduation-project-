import joi from 'joi';
export const addGroup=joi.object({
    groupName:joi.string().min(1).max(80).required(),
    capacity:joi.number().min(10).max(60).required(),
    groupSupervisor:joi.string().min(5).required(),

}).required();
export const getAllFreeStudentsInSpRegion=joi.object({
   region:joi.string().valid("Zamalek", "Maadi", "Mohandessin", "Garden City", "Dokki", "Heliopolis", "Nasr City", "Downtown Cairo Wust El Balad", "Agouza", "Manial", "El Rehab City", "New Cairo", "Ain Shams", "Shubra", "Helwan", "Sayeda Zeinab", "Abbassiya", "Rod El-Farag", "Shorouk City", "Darb al-Ahmar", "Bab al-Louq", "Giza Square", "Giza Corniche", "Imbaba", "El Marg", "El Basatin", "El Matareya", "El Zaher", "El Tebeen", "El Salam City", "El Sayeda Zainab", "El Khalifa", "El Nozha", "El Masara", "El Sahel", "El Khanka", "El Manyal", "El Darassa", "El Sahel", "El Basateen", "El Waily", "El Waili", "El Tebeen", "El Kholafaa El Rashedeen", "El Mosheer", "El Katameya", "El Qahira", "El Maasara", "Bulaq", "Dar El Salam", "El Omraneya", "El Agouzah", "El Matariya", "El Warraq", "El Zawya El Hamra", "Hadayek El Ahram", "Hadayek Helwan", "Hadayek El Kobba", "Hadayek El Maadi", "Helwan City", "Mokattam", "El Sharabeya", "El Marg", "El Zeitoun", "El Khalifa", "El Gamaliya", "El Moski", "El Khalifa", "El Sawah", "El Darb El Ahmar","El Doki El Nassr", "El Giza El Bahriya", "El Basatin El Gharbiya", "El Basatin El Sharkiya", "El Salam City El Gedida", "El Moneeb", "El Waily El Gedida", "El Sawah", "El Haggana", "El Marj", "El Quba", "El Qanatir El Khayriya", "El Agouza El Gedida", "El Ibrahimeya", "El Omraniya", "El Tawfiqiya", "El Khasos", "El Darasa", "El Manshiya El Gedida", "El Marg El Gedida"),
}).required();
export const deleteGroupSchema=joi.object({
    groupId:joi.string().min(5).required(),
}).required();
export const updateData=joi.object({
    groupName:joi.string().min(1).max(80),
    capacity:joi.number().min(10).max(70),
}).required();
export const upadteSupervisorGroup=joi.object({
    groupSupervisor:joi.string().min(5).required(),
}).required();

export const getAllGroups=joi.object({
    condition:joi.string().valid("withoutSupervisor","withSupervisor"),
}).required();
export const addStuents=joi.object(
{
    studentsId:joi.array().items(joi.string().min(5).required()).min(1).required(),
}).required();
export const getAllByFilter=joi.object({
    groupName:joi.string().min(0),
}).required();
export const removeChildrenFromGroup=joi.object({
    children:joi.array().items(joi.string().min(5).required()).min(1).required(),
}).required();
