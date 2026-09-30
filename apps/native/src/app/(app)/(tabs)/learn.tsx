import { useState } from "react";
import { View } from "react-native";
import { useTranslation } from "@repo/i18n/native";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui-native/components/tabs";
import { Text } from "@repo/ui-native/components/text";
import { cn } from "@repo/ui-native/lib/utils";
import { EnrolledCourseList } from "@/modules/learn/components/enrolled-course-list";
import { ExploreCourseList } from "@/modules/learn/components/explore-course-list";

type LearnTab = "explore" | "enrolled";

/** Explore / Enrolled (web: two nav entries). Both lists stay mounted so each keeps its search. */
export default function LearnScreen() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<LearnTab>("explore");

  return (
    <View className="flex-1 bg-background">
      <Tabs value={tab} onValueChange={(value) => setTab(value as LearnTab)} className="px-4 pt-4">
        <TabsList className="w-full">
          <TabsTrigger value="explore" className="flex-1">
            <Text>{t("learn.explore.title")}</Text>
          </TabsTrigger>
          <TabsTrigger value="enrolled" className="flex-1">
            <Text>{t("learn.enrolled.title")}</Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <View className={cn("flex-1", tab !== "explore" && "hidden")}>
        <ExploreCourseList />
      </View>
      <View className={cn("flex-1", tab !== "enrolled" && "hidden")}>
        <EnrolledCourseList />
      </View>
    </View>
  );
}
