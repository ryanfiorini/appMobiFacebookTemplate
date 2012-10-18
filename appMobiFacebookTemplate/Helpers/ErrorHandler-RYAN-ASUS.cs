using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace appMobiFacebookTemplate.Helpers
{
    public class ErrorHandler
    {

        public static ScriptResponse setupErrorResponse(ErrorsEnum otee)
        {
            return setupErrorResponse(otee, "");
        }

        public static ScriptResponse setupErrorResponse(ErrorsEnum otee, string token)
        {
            return setupErrorResponse(EnumHandler.getErrorNumberAttribute(otee), EnumHandler.getErrorDescriptionAttribute(otee), token);
        }

        public static ScriptResponse setupErrorResponse(string responseCode, string message, string token = "")
        {
            ScriptResponse sr = new ScriptResponse();
            sr.ResponseCode = responseCode;
            sr.Message = message;
            sr.token = token;
            return sr;
        }
    }

    public enum ErrorsEnum
    {
        [ErrorNumber("E000200")]
        [ErrorDescription("Facebook Post Failed.")]
        E000200,

        [ErrorNumber("E000201")]
        [ErrorDescription("Facebook Post Failed: User is not logged in.")]
        E000201,

        [ErrorNumber("E000202")]
        [ErrorDescription("Facebook Get Failed.")]
        E000202,

        [ErrorNumber("E000203")]
        [ErrorDescription("Facebook Get Failed: User is not logged in.")]
        E000203
    }

    [AttributeUsage(AttributeTargets.All)]
    public class ErrorNumberAttribute : System.Attribute
    {
        public readonly string Number;

        public override string ToString()
        {
            return this.Number;
        }

        public ErrorNumberAttribute(string number)
        {
            this.Number = number;
        }
    }

    [AttributeUsage(AttributeTargets.All)]
    public class ErrorDescriptionAttribute : System.Attribute
    {
        public readonly string Description;

        public override string ToString()
        {
            return this.Description;
        }

        public ErrorDescriptionAttribute(string description)
        {
            this.Description = description;
        }
    }
}

