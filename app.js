

//=======BUDGET CONTROLLER
var budgetController=(function(){
    //Expenses function constructor for the expenses items
    var Expenses= function(id, description, value){
        this.id = id;
        this.desciption = description;
        this.value = value;
        this.percentage=-1;// property to store the expenses percentage of this object of the total income
        
    } 
    //This method is to calculate percentages of the individual expenses objects.
    Expenses.prototype.calcPercentage= function(totalIncome){
           if(totalIncome>0){
            this.percentage= Math.round((this.value/totalIncome)*100);
           }
           else{
               this.percentage=-1;
           }
          
    };

    //This function pr the constructor method is just to get the percentage calculated above.
    //This is just to have each function do only one task.
    Expenses.prototype.getPercentage= function(){
        return this.percentage;
    };

    //Income function constructor for the income objects.
    var Incomes=  function(id, description, value){
        this.id = id;
        this.desciption = description;
        this.value = value
    } 
    
    // Function to calculate the total incomes and expenses. Its private to this module.
     var calculateTotal = function(type){

        var sum=0;
        
        data.items[type].forEach(function(curr, index, array){
             sum+=curr.value; // curr is an income or an expense object which has a value property.
        });
        data.total[type]= sum;

     }

    // Object for Data structure for all the items.(incomes and expenses)
    var data={
            items:{
                inc:[],//Array for For storing all income items
                exp: [] //For storing all expenses items
            },
            total:{
                inc: 0, //For storing total income value
                exp: 0
            },
            budget: 0,// for storing the total budget.
            percentage: -1 // for storing the percentage of income that we spent.
    };

    return{
        //Method to add item to our data structure.
        addItem: function(type,des,val){
            var newItem,ID;
            //Id = Id of last element of the array+1

            //Create new ID
            //For the first element ID=0
            if(data.items[type].length<=0)
            {
                ID=0;
            }
            else
            {
                ID= data.items[type][data.items[type].length-1].id+1;
            }
           


            //Creating a new item based on the input data.
            if(type==="inc"){
                newItem= new Incomes(ID,des,val);
            }
            else if(type==="exp"){
                newItem= new Expenses(ID,des,val);
            }

            //Add the new object to the approprate array.
            //Since type= "inc"or "exp" which is the same as the property(array) names of the data object.
            //So can be directly used to index into the correct array which is "inc" or "exp"

            //Push it into our data structure.
            data.items[type].push(newItem);

            //Return the new item.
            return newItem;
        }, 

        //Public method to delete an item.
        deleteItem: function(type, id){
              var ids, index;

              //This ids is  an array of the ID of all elements of the  type of the item to be deleted.
              ids=data.items[type].map(function(current){
                            return current.id;
              });
             
              index =  ids.indexOf(id);

              //If the element is not present in the array of its type, its index=-1.
              if(index!==-1){
                     data.items[type].splice(index,1);
              }
        },
        
        calculateBudget: function(){
                //calculate total expenses and total income.
                calculateTotal("inc");
                calculateTotal("exp");

                // calculate the budget.
                data.budget= data.total.inc - data.total.exp;

                //Calculate the total percentage of income that we spent.
                if(data.total.inc>0){
                    data.percentage= Math.round(((data.total.exp)/(data.total.inc))*100);
                }
                else{
                    data.percentage=-1;
                }
               


        },
        
        //This method is to calculate the percentages of the the expenses objects/items.
        calculatePercentages: function(){
              // This will calculate percentages of all the expenses objects in our data structure.
              data.items.exp.forEach(function(curr,index,array){
                       curr.calcPercentage(data.total.inc);
              }
              ) ;   

        },
        
        //This method is just to get the percentages.
        getPercent: function(){
            // Get the percentage of all the expense objects.
             var allPerc= data.items.exp.map(function(current){
                     return current.getPercentage();
               });
               return allPerc;
        },

       // This function just returns the values calculated above in an object
        getBudget: function(){
            return {//This is an object.
                    totalInc: data.total.inc,
                    totalExp: data.total.exp,
                    budget: data.budget,
                    percentage: data.percentage
            };
        },

        

        //This method to display the data structure when an item is added.
        testing: function(){
            console.log(data);
        }
    };



 })();


 //=========UICONTROLLER
 var UIController=(function(){
            // object , for all the elements classes to stay organized.
            var DOMstrings={
                inputType:'.add__type',
                inputDescription: '.add__description',
                inputValue: '.add__value',
                inputBtn: '.add__btn',
                incomeContainer: '.income__list',
                expensesContainer: '.expenses__list',
                budgetIncomeValue: ".budget__income--value",
                budget: ".budget__value",
                budgetExpenseValue: ".budget__expenses--value",
                budgetExpensePercentage: ".budget__expenses--percentage",
                container: ".container",
                expensesPercLabel: ".item__percentage",
                dateLabel: ".budget__title--month"
                
            };
            //Method to format the numbers in the UI. Private method since only used inside this module.
             var formatNumbers= function(num, type){
                /*Rules=====
                   + or - before the numbers.
                   exactly two digits after decimal point.
                   Comma seperating the thousandth digit.

                   E.g: 2345.4567-> + 2,345.46
                        2000 ->  + 2,000.00
                
      
                */
                   var n, numSplit, int, dec, places, sign;
                    n= Math.abs(num);
                    n= n.toFixed(2);
                    numSplit= n.split('.');
                    int= numSplit[0];
                   
                    if(int.length>6){
                        int= int.substr(0,1)+ ','+ int.substr(1,3)+ ','+ int.substr(4,3);
                    }
                    else if(int.length>3){
                        places= int.length-3;
                        int= int.substr(0,places)+ ','+ int.substr(places,3);
                    }

                    dec=numSplit[1];

                    sign=(type==="inc")?"+":"-";

                    return (sign+ " "+int+ "." + dec);

            }

             //Custom function for using forEach method in nodeLists.
                    /*args: list: the nodeList object,
                            callback: the function applied to each object in the nodeList
                     */
            var nodeListForEach= function(list, callback){
                for(var i=0;i<list.length;i++){
                     callback(list[i],i);
                }
          }

            return{
                //Method to get the input when user adds a new item.
                getInput: function(){
                    //Returning an object with type, description, value as its properties so that we can access all three
                    //together by a single object.
                    return{
                        type: document.querySelector(DOMstrings.inputType).value,   //Will be either "inc" or "exp"
                        desciption: document.querySelector(DOMstrings.inputDescription).value,
                        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
                    };
                    
                },
                
                //Method to add the item to the UI.
                //This obj is the new item object created and added to the data structure. 
                addListItem: function(obj,type){
                    var html,newHtml,element;
                        // Create an HTML string with some placeholder text.
                        if(type==='inc'){
                            element= DOMstrings.incomeContainer;
                            html= '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                        }
                        else if(type==='exp'){
                            element=DOMstrings.expensesContainer;
                            html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                        }
                        
                        

                        // Replace the placeholder text with some actual data.
                        
                        newHtml=html.replace('%id%',obj.id);
                        newHtml=newHtml.replace('%description%',obj.desciption);
                        newHtml=newHtml.replace('%value%',formatNumbers(obj.value, type));
                        //To add the new item HTML to the DOM.
                        document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
                        //Insert the HTML into the DOM.

                },

                //Method to delete an item from the UI.
                //selectorID= inc-0 or exp-0.
                deleteListItem: function(selectorID){

                    var el=document.getElementById(selectorID);
                    el.parentNode.removeChild(el);

                },
            
                //Method to clear input fields after adding an input.
                clearFields: function(){
                    var fields,fieldArr;
                    //To select the  elements with .add__description and .add__value as classes
                    fields=document.querySelectorAll(DOMstrings.inputDescription+','+ DOMstrings.inputValue); //returns NodeList object
                   
                    //To convert the above nodeList to an array.
                    fieldArr= Array.prototype.slice.call(fields);
                    
                    /* forEach menthod applies the function in the argument to all the elements of the array 'fieldArr'.
                       current: the HTML element with DOMstrings.inputDescription and DOMstrings.inputValue classes.
                       index: 0 and 1 since only two elements.
                       current.value: like the .value applied to DOM elements. 
                    */
                    fieldArr.forEach(function(current,index, array){
                          /*console.log('current: ',current);
                          console.log('-------------------------------');
                          console.log('index: ',index);
                          console.log('-------------------------------');
                          console.log('array:',array);
                          console.log('-------------------------------');
                          console.log('current.value:',current.value);*/

                          current.value="";
                    });
                    //To set the focus on the description field.
                    fieldArr[0].focus();
                },

                //Method to display the budget on the UI topmost
                displayBudget: function(obj){
                      var type;
                      type= (obj.budget>=0)? "inc":"exp";
                      document.querySelector(DOMstrings.budget).textContent= formatNumbers(obj.budget,type);
                      document.querySelector(DOMstrings.budgetIncomeValue).textContent= formatNumbers(obj.totalInc,"inc");
                      document.querySelector(DOMstrings.budgetExpenseValue).textContent= formatNumbers(obj.totalExp, "exp");
                      if(obj.percentage>0){
                        document.querySelector(DOMstrings.budgetExpensePercentage).textContent= obj.percentage+'%';
                      }
                      else{
                        document.querySelector(DOMstrings.budgetExpensePercentage).textContent= '---';
                      }
                      
                },

                // Method to display the expenses object percentages.\
                // arg: percenatges array
                displayPercentages: function(percentages){
                    //Since there can be many expense objects we use querySelectorAll.
                    var fields= document.querySelectorAll(DOMstrings.expensesPercLabel);
                    
                   
                    
                   
                    //Calling the above function
                    nodeListForEach(fields, function(current, index){
                              // Defining the callback function here.
                              if(percentages[index]>0){
                                current.textContent= percentages[index]+ '%';
                              }
                              else
                              {
                                current.textContent= '---';
                              }
                              
                    } );

                },
                 
                //Method to display the month and year in the budget.
                displayDate: function(){
                    var now, year, month,monthNames;
                    monthNames= ["Jan","Feb","March","April","May","June","July","August","Sept","Oct","Nov","Dec"]
                    now= new Date();
                    year= now.getFullYear();
                    month= now.getMonth()
                    document.querySelector(DOMstrings.dateLabel).textContent= monthNames[month] +","+year;
                },

                //Method to change style based on the changed type of input.
                changedType: function(){
                         var fields= document.querySelectorAll(DOMstrings.inputType+','+ DOMstrings.inputDescription+
                         ','+ DOMstrings.inputValue);

                         nodeListForEach(fields, function(current, index){
                             current.classList.toggle('red-focus');
                         });

                         document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

                },

                //Method to return the DOMstrings objects
                getDOMStrings:function(){
                            return DOMstrings;
            }
        };


 })();
 


 //==========APP CONTROLLER
 var controller=(function(budgetCtrl,UICtrl){
     //Function to set up the event listeners and starting the overall functioning of the project.
     var setUpEventListeners=function(){
            var DOM= UICtrl.getDOMStrings();
            document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);
          
            document.addEventListener('keypress',function(event){
                if(event.keyCode===13 || event.which===13){
                    ctrlAddItem();
                }
            });
             
            //This eventListener is added to the container class element to use event delegation.
            document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
            //This eventListener is for the input type change event.
            //UICtrl.changedType is the callback function.
            document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changedType);
     }



     //This function is called when Enter key is pressed or the button in the UI is clicked after a new item is added.
     //This function is the control center of the application. It tells which modules to do what.
     var ctrlAddItem=function(){
               var input, newItem,addItemToUI;

        //1. Get the input field data.
           input=UICtrl.getInput();
           //console.log(input);

         //The steps 2-5 should happen only if the input desciption is not empty and the input value is a valid number greater than 0.
         if(input.desciption!=="" && !isNaN(input.value) && input.value>0)
         {
                 //2. Add the item to the budget controller.

                    //newItem is the new item object just created. 
                    //this is the object to be passed in the addListItem method in the UI Controller.
                    newItem= budgetCtrl.addItem(input.type, input.desciption, input.value);

                    //3. Add the item to the UI.
                        //Using the addListItem method.
                        UICtrl.addListItem(newItem,input.type);
            
            
                    //4. Clear input fields after an item is inputted.
                        UICtrl.clearFields();
            
                    // 5. Calculate and update the budget.
                        updateBudget();

                    //6. calculate and update the percentages.
                       updatePercentages();
            }


       

       
     }


     //This function is to update the budget on the UI.
     var updateBudget= function(){
          // 1. Calculate the budget.(Done on the budgetcontroller)
                budgetCtrl.calculateBudget();
          // 2. Return the budget.(Done on the budgetcontroller)
                var budget= budgetCtrl.getBudget();
           //3. Display the budget to the UI.(Done on the UIcontroller)
                UICtrl.displayBudget(budget);
     }
     



     // This function is to update the individual expenses percentages.
     var updatePercentages= function(){
         //1. Calculate the percentages.
         budgetCtrl.calculatePercentages();

         //2. Read the percentages from the budget Controller.
         var percentages= budgetCtrl.getPercent();
         //3. Update the  UI with the new percentages.
              UICtrl.displayPercentages(percentages);

     }

    //Function to add delete functionality.
    var ctrlDeleteItem= function(event){
        var itemID,splitID,type,ID;
        itemID=event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
                    splitID= itemID.split('-');
                    type= splitID[0];
                    ID= parseInt(splitID[1]);

                      //1. Delete the item from our data structure.
                        budgetCtrl.deleteItem(type,ID);

                        //2. Delete the item from the UI.
                        UICtrl.deleteListItem(itemID);

                        //3. Update  the budget.
                        updateBudget();

                        //4. calculate and update the percentages.
                       updatePercentages();
                    }
        }


      
    

     //Returning the init method for the public so that the eventListeners setup function can be called.
     return {
         init: function(){
             console.log('Application has started.');
             //To set initially the budget and all values to 0.
             UICtrl.displayDate();
             UICtrl.displayBudget( {totalInc: 0,
                totalExp: 0,
                budget: 0,
                percentage: -1
            });
             return setUpEventListeners();
         }
     };

 })(budgetController,UIController);

 controller.init();
