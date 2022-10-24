import React from "react"; 
import './FloatingText.css'

export default function FloatingText(props){

    return(
        <div>
           {//Creates Container for whole row
            props.elements.map( row =>{ return(
            <div className="floatingTextLine">{

                //Creates Elements inside a row
                row.map(element => {

                    //Creates text element
                    if(element.type == 'text')
                    return( <label className="floatingTextLabel" > {element.text} </label>)
                    
                    //Creates Container for grouped img elements
                    else if(element.type == 'image')
                        return(
                            <div className="floatingTextImgContainer">{
                                element[Input.activeInput].map(img => {
                                    return( <img className="floatingTextImg" src={files.sprites.InputPrompts[img]}></img>)
                                })
                            }</div>
                        )
                })

            }</div>
           )})}
        </div>
    )
}

