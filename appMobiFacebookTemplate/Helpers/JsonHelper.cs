using System;
using System.IO;
using System.Runtime.Serialization.Json;
using System.Text;


namespace AppMobiWindows8FacebookTemplate.Helpers
{
    public static class JsonHelper
    {
        public static string ToJson(this object obj)
        {
            if (obj == null)
            {
                return "null";
            }

            DataContractJsonSerializer ser = new DataContractJsonSerializer(obj.GetType());

            MemoryStream ms = new MemoryStream();
            ser.WriteObject(ms, obj);

            ms.Position = 0;

            string json = String.Empty;

            using (StreamReader sr = new StreamReader(ms))
            {
                json = sr.ReadToEnd();
            }

            //ms.Close();

            return json;
        }
    }
}
