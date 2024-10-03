using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace DataAccessLibrary.Models;

public class ApplicationRole : IdentityRole
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public override string Id
    {
        get => base.Id;
        set => base.Id = value;
    }
    
    public ApplicationRole() : base()
    {
    }
    
    public ApplicationRole(string name) : base(name)
    {
    }
}