function NameAndInput({name, value, setter, type} : {name:string, value:string, setter: React.Dispatch<React.SetStateAction<string>>, type:string}){

    return (
        <div className="flex flex-col">
            {name}
            <input
                type={type}
                value={value}
                className="border rounded bg-white px-1"
                onChange={(e) => { setter(e.target.value) }}
            >
            </input>
        </div>
    );
}

export default NameAndInput;