import { supabase } from "../config.js";

export async function isUser(phone: string) {
  const { data, error } = await supabase.from("users").select("user_phone").eq("user_phone", phone);

  if (error) {
    console.error("There has been an error retrieving all active users: ", error);
    return false
  } else if (!data || data.length === 0) {
    console.error("No user data collexted");
    return false;
  } else {
    return true;
  }
}

export async function saveNewUser(phone: string, name: string) {
  const { data: existingUser, error } = await supabase.from("users").select("user_phone").eq("user_phone", phone).single();

  if (error) {
    console.error("Error retrieving user: ", error);
    return Response.json(
      { message: error },
      { status: 500 }
    );
  }

  if (existingUser) {
    return Response.json(
      { message: `User found: ${existingUser?.user_phone}`},
      { status: 200 }
    );
  }  

  const { data: response, error: insertError } = await supabase.from("users").insert({
    user_phone: phone,
    name: name,
    last_message: new Date().toISOString(),
    message_count: 0
  });

  if (insertError) {
    console.error("Error inserting new user: ", insertError);
    return Response.json(
      { message: insertError },
      { status: 500 }
    );
  }

  return Response.json(
    { message: "User successfully created" },
    { status: 200 }
  );
};

export async function updateUser(phone: string) {
  const { data: user, error: fetchError } = await supabase.from("users").select("user_phone, message_count").eq("user_phone", phone).single();

  if (fetchError) {
    console.log("Error fetching existing user: ", fetchError);
    return Response.json(
      { message: `Error fetching existing user: ${fetchError}` },
      { status: 500 }
    );
  }

  const newCount = (user?.message_count || 0) + 1;

  const { data, error } = await supabase.from("users").update({
    "message_count": newCount,
    "last_message": new Date().toISOString()
  }).eq("user_phone", phone)

  if (error) {
    return Response.json(
      { message: `Error updating user data: ${error}` },
      { status: 500 }
    );
  } else {
    return Response.json(
      { message: "User updated" },
      { status: 200 }
    );
  }
}