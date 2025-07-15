using UnityEditor;
using UnityEngine;

public class LODSetupEditor : EditorWindow
{
    public GameObject[] tomatoGroups;
    private Vector2 scrollPos;

    [MenuItem("Tools/LOD Setup Tool")]
    public static void ShowWindow()
    {
        GetWindow<LODSetupEditor>("LOD Setup Tool");
    }

    private void OnGUI() // Editor �� GUI ����� ����
    {
        SerializedObject so = new SerializedObject(this);
        SerializedProperty groupsProp = so.FindProperty("tomatoGroups");

        scrollPos = EditorGUILayout.BeginScrollView(scrollPos); // ��ũ�� ����

        EditorGUILayout.PropertyField(groupsProp, new GUIContent("Tomato Groups"), true);

        if (GUILayout.Button("Apply LOD Setup & Controller"))
        {
            foreach (GameObject group in tomatoGroups)
            {
                var setupTool = new GameObject("TempLODSetter").AddComponent<LODSetupTool>();
                setupTool.tomatoGroups = new GameObject[] { group };
                setupTool.ApplyLOD();
                //setupTool.Controller();
                DestroyImmediate(setupTool.gameObject);
            }
            Debug.Log("LOD ���� �Ϸ�");
        }

        if (GUILayout.Button("Set Fade Mode to CrossFade"))
        {
            foreach (GameObject obj in tomatoGroups)
            {
                LODGroup lodGroup = obj.GetComponent<LODGroup>();
                if (lodGroup == null) continue;

                // �� LOD�� fadeTransitionWidth�� ����
                var lods = lodGroup.GetLODs();
                for (int i = 0; i < lods.Length; i++)
                {
                    lods[i].fadeTransitionWidth = 0.3f; // ���� �� (0~1)
                }

                lodGroup.fadeMode = LODFadeMode.CrossFade;
                lodGroup.animateCrossFading = true;
                lodGroup.SetLODs(lods);
                lodGroup.RecalculateBounds();
            }
        }
        EditorGUILayout.EndScrollView(); // ��ũ�� ����
        so.ApplyModifiedProperties();
    }
}
