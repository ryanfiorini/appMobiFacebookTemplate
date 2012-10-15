using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

using System.Text;
using System.Threading.Tasks;

namespace AppMobiClassLibrary.Helpers
{
    public class EnumHandler
    {
        public EnumHandler() { }

        public static string getErrorNumberAttribute(Enum value)
        {
            FieldInfo fi = value.GetType().GetRuntimeField(value.ToString());
            ErrorNumberAttribute[] attributes = (ErrorNumberAttribute[])fi.GetCustomAttributes(typeof(ErrorNumberAttribute), false);
            if (attributes.Length > 0)
            {
                return attributes[0].ToString();
            }
            else
            {
                return value.ToString();
            }
        }

        public static string getErrorDescriptionAttribute(Enum value)
        {
            FieldInfo fi = value.GetType().GetRuntimeField(value.ToString());
            ErrorDescriptionAttribute[] attributes = (ErrorDescriptionAttribute[])fi.GetCustomAttributes(typeof(ErrorDescriptionAttribute), false);
            if (attributes.Length > 0)
            {
                return attributes[0].ToString();
            }
            else
            {
                return value.ToString();
            }
        }

    }
}
