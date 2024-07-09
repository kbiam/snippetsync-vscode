const vscode = require('vscode')
const axios = require('axios')
const keytar = require('keytar')


const SERVICE_NAME = 'snippet-sync';
const ACCOUNT_NAME = 'token';


async function login(){
	const email = await vscode.window.showInputBox({prompt:"Enter your email", email:true})
	const password = await vscode.window.showInputBox({prompt:"Enter your password",password:true})

	if(!email || !password){
		vscode.window.showErrorMessage("Email and Password are required");
		return
	}
	try{
		const response = await axios.post('https://snippetsync-backend.onrender.com/login',{email,password});
		if(response.data.token){
			const token = response.data.token
			await keytar.setPassword(SERVICE_NAME,ACCOUNT_NAME,token)
			vscode.window.showInformationMessage('Logged in successfully!');

		}
	}
	catch(error){
		vscode.window.showErrorMessage("Login failed, Please check your credentials");
	}

}

async function getToken(){
	return await keytar.getPassword(SERVICE_NAME, ACCOUNT_NAME)
}

async function addSnippets(){
	const token = await getToken()
	if(!token){
		vscode.window.showErrorMessage("Please login first");
		return
	}
	try {
		const title = await vscode.window.showInputBox({prompt:"Enter a title"});
		const description = await vscode.window.showInputBox({prompt:"Enter a description"})
		const language = await vscode.window.showInputBox({prompt:"Enter the language"})
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
		  vscode.window.showErrorMessage('No active editor found.');
		  return;
		}
		const selection = editor.selection
		const snippet = editor.document.getText(selection)
	
		if (!snippet) {
			vscode.window.showErrorMessage('No text selected.');
			return;
		  }

		const response = await axios.post('https://snippetsync-backend.onrender.com/addSnippet',{title,description,snippet,language},
			{headers:{"Authorization":`Bearer ${token}`}}
		)
		vscode.window.showInformationMessage('Snippet sent successfully!');

	} catch (error) {
		vscode.window.showErrorMessage('Failed to send snippet.');

	}
}

function activate(context){
	let loginCommand = vscode.commands.registerCommand("snippetsync.login",login)
	let addSnippetCommand = vscode.commands.registerCommand("snippetsync.addSnippet",addSnippets);

	context.subscriptions.push(loginCommand);
	context.subscriptions.push(addSnippetCommand)
}
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
