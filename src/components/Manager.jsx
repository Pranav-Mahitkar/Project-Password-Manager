import React from 'react'
import { useRef, useState, useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { v4 as uuidv4 } from 'uuid';


const Manager = () => {
    const ref = useRef()
    const passwordref = useRef()
    const [form, setform] = useState({ site: "", username: "", password: "" })

    const [passwordArray, setpasswordArray] = useState([])

    useEffect(() => {
        let passwords = localStorage.getItem("passwords")
        if (passwords) {
            setpasswordArray(JSON.parse(passwords))
        }
    }, [])


    const showPassword = () => {
        if (ref.current.src.includes("icons/eyecross.png")) {
            passwordref.current.type = "password"
            ref.current.src = "icons/eye.png"
        } else {
            ref.current.src = "icons/eyecross.png"
            passwordref.current.type = "text"
        }
    }

    const savePassword = () => {
        if (form.site == "" || form.username == "" || form.password == "") alert("Fields cannot be empty.")
        else {
            setpasswordArray([...passwordArray, { ...form, id: uuidv4() }])
            localStorage.setItem("passwords", JSON.stringify([...passwordArray, { ...form, id: uuidv4() }])) // State takes time to update that's why passwordArray was not given.
            console.log([...passwordArray, { ...form, id: uuidv4() }])
            setform({ site: "", username: "", password: "" })
            toast('Password saved!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light"
            });
        }
    }
    const handleChange = (e) => {
        setform({ ...form, [e.target.name]: e.target.value })
    }

    const copytext = (text) => {
        toast('Copied to clipboard', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light"
        });
        navigator.clipboard.writeText(text)
    }

    const dlt = (id) => {
        const a = confirm("Do you want to delete this password?");
        if (a) {
            const updatedPasswords = passwordArray.filter(item => item.id !== id);
            setpasswordArray(updatedPasswords);

            // If no passwords remain, clear localStorage instead of storing an empty array
            if (updatedPasswords.length === 0) {
                localStorage.removeItem("passwords");
            } else {
                localStorage.setItem("passwords", JSON.stringify(updatedPasswords));
            }

            toast('Deleted!', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light"
            });
        }
    };

    const edit = (id) => {
        setform(passwordArray.filter(item => item.id === id)[0])
        setpasswordArray(passwordArray.filter(item => item.id !== id))
    }

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={4000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />

            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"><div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-green-400 opacity-20 blur-[100px]"></div></div>
            <div className='container min-h-[calc(100vh-132px)] rounded-xl border bg-slate-100 max-w-4xl mx-auto p-3 flex flex-col items-center'>
                <div className='text-center text-3xl font-sans text-green-500 font-[600]'>
                    <span>&lt;</span>
                    <span className='text-slate-800'>Pass</span>
                    OP
                    <span>/&gt;</span>
                </div>
                <div className='text-center font-[450] text-slate-700'>Your Own Passwor Manager.</div>
                <div className="firstbox flex flex-col p-2 gap-3 w-full">
                    <input onChange={handleChange} name="site" placeholder='Enter URL' className='rounded-full border border-green-500 px-4 py-1 w-full' type="text" value={form.site} />
                    <div className='secondandthirdbox flex flex-col md:flex-row gap-3 w-full'>
                        <input onChange={handleChange} placeholder='Enter Username' name="username" className='rounded-full border border-green-500 px-4 py-1 w-full' type="text" value={form.username} />
                        <div className="relative flex items-center">
                            <input ref={passwordref} name="password" onChange={handleChange} placeholder='Enter Password' className='rounded-full border border-green-500 px-4 py-1 w-full' type="password" value={form.password} />
                            <span className='absolute right-0 px-2 cursor-pointer' onClick={showPassword} >
                                <img ref={ref} width={22} src="icons/eye.png" alt="eye" /></span>
                        </div>
                    </div>
                </div>
                <button onClick={savePassword} className='btn mx-2 flex items-center justify-center text-sm border rounded-full bg-green-600 gap-2 w-1/4 cursor-pointer my-2'>
                    <lord-icon
                        src="https://cdn.lordicon.com/jgnvfzqg.json"
                        trigger="hover">
                    </lord-icon>Add Password
                </button>
                <div className='font-bold text-lg text-slate-900 py-2 underline' >Your Passwords</div>
                {passwordArray.length === 0 && <div> No passwords to show</div>}
                {passwordArray.length != 0 && <div><table className="border border-white  text-black w-full table-fixed bg-green-100">
                    <thead>
                        <tr className="border border-white bg-green-600 text-white font-bold">
                            <th className="border border-white p-2 w-[45%]">Site</th>
                            <th className="border border-white p-2 w-[20%]">Username</th>
                            <th className="border border-white p-2 w-[20%]">Passcode</th>
                            <th className="border border-white p-2 w-[15%]">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {passwordArray.map((item, index) => {
                            return <tr key={index} className="border border-white px-2 ">
                                <td className="border border-white p-2">
                                    <div className='flex justify-between align-middle'>
                                        <a href={item.site} target="_blank">
                                            {item.site}
                                        </a>
                                        <span onClick={() => { copytext(item.site) }}>
                                            <lord-icon
                                                style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover" >
                                            </lord-icon>
                                        </span>
                                    </div>
                                </td>
                                <td className="border border-white p-2 ">
                                    <div className='flex justify-between align-middle'>

                                        <span>{item.username}</span>
                                        <span onClick={() => { copytext(item.username) }}>
                                            <lord-icon
                                                style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover" >
                                            </lord-icon>
                                        </span>
                                    </div>
                                </td>
                                <td className="border border-white p-2">
                                    <div className='flex justify-between align-middle'>
                                        <span>{item.password}</span>
                                        <span onClick={() => { copytext(item.password) }}>
                                            <lord-icon
                                                style={{ "width": "25px", "height": "25px", "paddingTop": "3px", "paddingLeft": "3px" }}
                                                src="https://cdn.lordicon.com/iykgtsbt.json"
                                                trigger="hover" >
                                            </lord-icon>
                                        </span>
                                    </div>
                                </td>
                                <td className="border border-white p-2">
                                    <div className='flex justify-around align-middle'>
                                        <span onClick={() => { edit(item.id) }}><lord-icon
                                            src="https://cdn.lordicon.com/gwlusjdu.json"
                                            trigger="hover"
                                            style={{ "width": "25px", "height": "25px" }}>
                                        </lord-icon></span>
                                        <span onClick={() => { dlt(item.id) }}><lord-icon
                                            src="https://cdn.lordicon.com/skkahier.json"
                                            trigger="hover"
                                            style={{ "width": "25px", "height": "25px" }}>
                                        </lord-icon></span>

                                    </div>
                                </td>
                            </tr>
                        })}

                    </tbody>
                </table></div>}


            </div>
        </>
    )
}

export default Manager