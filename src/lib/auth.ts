import { supabase } from "./supabase.js";

export async function isUser(phone: string) {
  const { data, error } = await supabase.from("users").select("user_phone").eq("user_phone", phone)
  console.log("Is user data: ", data)
  if (error) {
    console.error("There has been an error retrieving all active users: ", error)
    return false
  } else if (!data || data.length === 0) {
    console.error("Couldn't fetch user data.")
    return false
  } else {
    return true
  }
}

export async function saveNewUser(body: any) {
  const contact = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0];
  const phone = contact?.wa_id
  const name = contact?.profile?.name;

  const { data: existingUser, error } = await supabase.from("users").select("user_phone").eq("user_phone", phone).single();

  console.log("Existing user: ", existingUser?.user_phone)
  if (existingUser) {
    console.log("User already exists.");
    return;
  }  

  const { data: response } = await supabase.from("users").insert({
    user_phone: phone,
    name: name,
    last_message: new Date().toISOString(),
    message_count: 0
  });

  console.log("Response when inserting user: ", response)

  /* if (error) {
    console.error("Error creating new user: ", error);
    return;
  } */
  console.log("New user successfully created");
};

export async function updateUser(phone: string) {
  const { data: user, error: fetchError } = await supabase.from("users").select("user_phone, message_count").eq("user_phone", phone).single();


  console.log("User to update: ", user?.user_phone)
  if (fetchError) {
    console.log("Error fetching user data: ", fetchError);
    return;
  }

  const newCount = (user?.message_count || 0) + 1;

  const { data, error } = await supabase.from("users").update({
    "message_count": newCount,
    "last_message": new Date().toISOString()
  }).eq("user_phone", phone)

  if (error) {
    console.error("Error updating user data: ", error)
  } else {
    console.log("User data successfully updated.");
  }
}