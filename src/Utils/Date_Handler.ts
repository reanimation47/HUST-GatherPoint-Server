export class DateHandler
{
    static GetDateTimeXHoursFromNow(xHours: number)
    {
        let currentDate = new Date()
        DateHandler.AddHours(currentDate, xHours)
        return currentDate
    }
    
    static AddHours(date: Date, hours: number)
    {
        date.setHours(date.getHours() + hours)
    }
}