import React, { useState } from 'react';
import './App.css';
import Input from './Components/input/input';
import sideImage from "./assets/img/bg.svg";
import logo from "./assets/img/logo.jpg";
import close from "./assets/img/x.svg";
import axios from 'axios';

const instance = axios.create({
  // baseURL: "https://robot.mobisha.ir/api/",
  baseURL: "http://localhost:4500/",
});

const App = () =>{
  const [step,setStep] = useState(1);
  const [form,setForm] = useState({error:{},times: {game1: 23, game2: 70, party: 276},reserve:{game1: false, game2: false, party: false}})
  const inputHandler = (tag , event) =>{
    let tempForm = {...form};
    tempForm[tag] = event.target.value;
    setForm(tempForm);
  }
  const getTimez = () =>{
    const reqForm = { 
      stdId: form.stdId,
      nationalCode: form.nationalCode,
      phoneNumber: form.phoneNumber,
      name: form.name,
      lastname: form.lastname,
      vaccineLink: form.vaccineLink
    };
    instance.get('/tickets/availableTime', { params: reqForm })
        .then(res => {
            let temp = {...form}
            temp.times = res.data.times;
            setForm(temp);
            setStep(2)
            // return res.data;
        })
        .catch(error => { 
          let temp = {...form}
          temp.serverError = error.response.data.error;
          setForm(temp);
          setTimeout(() => {
            let tempE = {...form}
            tempE.serverError = "";
            setForm(tempE);
          }, 3500);
        })
     
  }
  const classCalc = (num) =>{
      switch (num) {
        case -1:
          return ("selected");
        case 0:
          return ("disable");
        default:
          return ("box");
      }
  }
  const reserveHandler = (tag) =>{
    if(form.times[tag] > 0){
      let tempForm = { ...form };
      switch (tag) {
        case "game1":
          if(!form.reserve.game2 && form.times.game2 >= 0){
            tempForm.reserve[tag] = !form.reserve[tag];           
          }
          break;
        case "game2":
          if(!form.reserve.game1 && form.times.game1 >= 0){
            tempForm.reserve[tag] = !form.reserve[tag];           
          }
          break;
        case "party":
            tempForm.reserve[tag] = !form.reserve[tag];           
          break
        default:
          break;
      }
      setForm(tempForm);
    }
  }
  const calcPrice = () =>{
    let price = 0;
    if(form.reserve.game1 || form.reserve.game2){
      price = price + 20;
    }
    if(form.reserve.party){
      price = price + 20;
    }
    if(price === 40){
      return "۳۰٬۰۰۰";
    }else{
      return "۲۰٬۰۰۰";
    }
  }
  const uploadImage = (event) => {
    const formData = new FormData();
    formData.append("file", event.target.files[0]);
    instance.post(`/tickets/uploadFile/`, formData)
        .then(res => {
          if(res.data.success){
            let temp = {...form};
            temp.image = res.data.fileName;
            setForm(temp)
          }
        })
        .catch(error => {
          let temp = {...form}
          temp.serverError = error.response.data.error;
          setForm(temp);
          setTimeout(() => {
            let tempE = {...form}
            tempE.serverError = "";
            setForm(tempE);
          }, 3500);
        });
     
  }
  const submit = () =>{
    if(form.image){

      const req = {
        stdId : form.stdId,
        nationalCode : form.nationalCode,
        phoneNumber : form.phoneNumber,
        paymentImage : form.image,
        reserve : form.reserve,
        vaccineLink: form.vaccineLink
      }
      instance.post(`/tickets/register/`, req)
          .then(res => {
            if(res.data.success){
              let temp = {...form}
              temp.reservationCode = res.data.reservationCode;
              setForm(temp);
              setStep(4);
            }
          })
          .catch(error => {
            let temp = {...form}
            temp.serverError = error.response.data.error;
            setForm(temp);
            setTimeout(() => {
              let tempE = {...form}
              tempE.serverError = "";
              setForm(tempE);
            }, 3500);
          });
    }
  }
  const closeToast = () => {
    let temp = {...form}
    temp.serverError = "";
    setForm(temp);
  }


  let myInp='';
  const stepRenderer = (step) =>{
    switch (step) {
      case 1:
        return(
          <React.Fragment>
            <div className="formContainer">
              <div className="formContent">
                <Input 
                  label="نام" 
                  tag="name"
                  inputHandler={inputHandler}
                  value={form.name} 
                  error={form.error.name} />
                <Input 
                  label="نام خانوادگی" 
                  tag="lastname"
                  inputHandler={inputHandler}
                  value={form.lastname} 
                  error={form.error.lastname} />
                <Input 
                  label="شماره دانشجویی" 
                  tag="stdId"
                  inputHandler={inputHandler}
                  value={form.stdId} 
                  error={form.error.stdId} />
                <Input 
                  label="کد ملی" 
                  tag="nationalCode"
                  inputHandler={inputHandler}
                  value={form.nationalCode} 
                  error={form.error.nationalCode} />
                <Input 
                  label="شماره تلفن همراه" 
                  tag="phoneNumber"
                  inputHandler={inputHandler}
                  value={form.phoneNumber} 
                  error={form.error.phoneNumber} />
                <Input 
                  label="لینک واکسن دیجیتال" 
                  tag="vaccineLink"
                  inputHandler={inputHandler}
                  value={form.vaccineLink} 
                  error={"برای شرکت در جشن کارت واکسن (دو دز) الزامی است."} />
              </div>
              <img alt="bg" src={sideImage} />
            </div>
            <div className="footer">
              <button onClick={()=>getTimez()}>
                ادامه
              </button>
            </div>
          </React.Fragment>
        )
      case 2:
        return(
          <React.Fragment>
            <h3 style={{marginTop: "16px"}} className="gameHeader">رزرو روز سرگرمی ۱۵م آذر</h3>
            <p className="priceNote">هزینه این برنامه ۲۰٬۰۰۰ تومان می‌باشد.</p>
            <div className="gameContainer">
              <div onClick={()=>reserveHandler("game1")} className="gameCol">
                  <div className={classCalc(form.times.game1)}>
                    <p>سانس ۱۰-۱۳</p>
                    <span>
                      {form.times.game1 >= 0 && !form.reserve.game1? `ظرفیت باقی مانده : ${form.times.game1}` : "رزرو شده"}
                    </span>
                  </div>
              </div>
              <div onClick={()=>reserveHandler("game2")} className="gameCol">
                  <div className={classCalc(form.times.game2)}>
                    <p>سانس ۱۳-۱۶</p>
                    <span>
                      {form.times.game2 >= 0 && !form.reserve.game2 ? `ظرفیت باقی مانده : ${form.times.game2}` : "رزرو شده"}
                    </span>
                  </div>
              </div>
            </div>
            <h3 style={{marginTop: "32px"}} className="gameHeader"> جشن روز دانشجو </h3>
            <p className="priceNote">هزینه این برنامه ۲۰٬۰۰۰ تومان می‌باشد.</p>
            <div className="gameContainer"> 
                <div onClick={()=>reserveHandler("party")} style={{"width": "328px" , "height": "72px"}} className={classCalc(form.times.party)}>
                  <p>ساعت برگذاری جشن ۱۶ آذر ۱۰-۱۲</p>
                  <span>
                    {form.times.party >= 0 && !form.reserve.party ? `ظرفیت باقی مانده : ${form.times.party}` : "رزرو شده"}
                  </span>
                </div>
            </div>
            <p className="priceNote">در صورت رزرو هر دو برنامه ۱۰٬۰۰۰ تومان تخفیف تعلق میگیرد!</p>
            <p className="priceNote">مبلغ پرداختی ۳۰٬۰۰۰ تومان</p>
            <div style={{marginTop: "64px"}} className="footer">
              <button onClick={ form.reserve.party || form.reserve.game1  || form.reserve.game2 ? ()=>setStep(3) : null}>
                ادامه
              </button>
            </div>
          </React.Fragment>
        )
      case 3:
        return(
          <React.Fragment>
            <div className="payment">
              <p>مبلغ قابل پرداخت <span>{calcPrice()}</span> میباشد.</p>
              <p>لطفا مبلغ مورد نظر را به شماره کارت ۰۶۸۲-۳۳۲۳-۳۳۷۷-۶۱۰۴ به نام دانشگاه علم و فرهنگ واریز کنید و عکس فیش واریزی را در قسمت زیر آپلود نمایید.</p>
              <div className={form.image ? "uploadImageDone" : "uploadImage"}>
                <input type="file" value="" ref={(ip) => myInp = ip} onChange={(event)=>uploadImage(event)} style={{display: "none"}}></input>
                <div onClick={() => {myInp.click()}} >
                  <p>{form.image ? "عکس آپلود شد" :"آپلود عکس فیش واریزی"}</p>
                </div>
              </div>
            </div>
            <div style={{marginTop: "64px"}} className="footer">
              <button onClick={()=>submit()}>
                ثبت نام
              </button>
            </div>
          </React.Fragment>
        )
      case 4:
        return(
          <div className="alldone">
            <p>رزرو با موفقیت انجام شد!</p>
            <p>کد پیگیری : {form.reservationCode}</p>
            <p>: )</p>
          </div>
        )
      default:
        break;
    }
  }
  return (
    <div className="app">
      <div className="ToastFrame" >
        <div className={form.serverError ? "alert" : "hideAlert" } id="toast">
          <p>{form.serverError}</p>
          <span onClick={()=>closeToast()} className="closebtn"><img alt="close" src={close} /></span>
        </div>
      </div>
      <div className="container">
        <div className="header">
            <h3>
              سامانه رزرو جشن روز دانشجو
            </h3>
            <img alt="logo" src={logo} />
        </div>
        {stepRenderer(step)}
      </div>
    </div>
  );
}

export default App;