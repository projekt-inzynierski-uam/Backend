import express, { response } from 'express'
import cors from 'cors'
import pool from './db.js'
import {v4} from 'uuid'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const PORT = process.env.PORT || 9001
const app = express()
app.use(cors())
app.use(express.json())

//get all todos
app.get('/todos/:userEmail', async (req, res) => {
    
    const { userEmail } = req.params;
    
    try {
        const todos = await pool.query('SELECT * FROM todos WHERE user_email = $1', [userEmail])
        res.json(todos.rows)
    } catch (err){
        console.error(err)
    }
})

//create a new todo
app.post('/todos', async (req, res) => {
    const {user_email, title} = req.body
    const id = v4()
    try{
        const newToDo = await pool.query(`INSERT INTO todos(id, user_email, title) VALUES ($1, $2, $3)`, 
        [id, user_email, title])
        res.json(newToDo)
    }catch(err){
        console.error(err)
    }
})

//edit a todo
app.put('/todos/:id', async(req, res) => {
    const {id} = req.params
    const {user_email, title} = req.body
    try{
        const editToDo = 
        await pool.query('UPDATE todos SET user_email = $1, title = $2 WHERE id = $3', 
        [user_email, title, id])
        res.json(editToDo)
    }catch(err){
        console.error(err)
    }
})

//delete a todo
app.delete('/todos/:id', async(req, res) => {
    const {id} = req.params
    try{
        const deleteToDo = 
        await pool.query('DELETE FROM todos WHERE id = $1', 
        [id])
        res.json(deleteToDo)
    }catch(err){
        console.error(err)
    }
})

//signup

app.post('/signup', async (req, res) =>{
    const {email, password} = req.body
    const salt = bcrypt.genSaltSync(10)
    const hashedPassword = bcrypt.hashSync(password, salt)
    try{
        const signUp = await pool.query('INSERT INTO users (email, hashed_password) VALUES ($1, $2)',
        [email, hashedPassword])

        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'})

        res.json({email, token})
    }catch(err){
        console.error(err)
        if(err){
            res.json({detail: err.detail})
        }
    }
})

//login

app.post('/login', async (req, res) =>{
    const {email, password} = req.body
    try{
        const users = await pool.query('SELECT * FROM users WHERE email = $1',
        [email])

        if(!users.rows.length) return res.json({detail: 'Użytkownik nie istnieje'})

        const success = await bcrypt.compare(password, users.rows[0].hashed_password)
        const token = jwt.sign({email}, 'secret', {expiresIn:'1hr'})

        if(success) {
            res.json({'email': users.rows[0].email, token})
        }else{
            res.json({detail: "Nie udało się zalogować"})
        }
    }catch(err){
        console.error(err)
    }
})

app.listen(PORT, () => 
    console.log(`Server running on port ${PORT}`)
)